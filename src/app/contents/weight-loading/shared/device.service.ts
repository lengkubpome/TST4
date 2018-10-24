import { MatSnackBar } from '@angular/material';
import { map, take, distinctUntilChanged } from 'rxjs/operators';
import { Injectable } from '@angular/core';

import { AngularFirestore, DocumentReference } from 'angularfire2/firestore';

import { Store } from '@ngrx/store';
import * as fromWeightLoading from './../store/weight-loading.reducer';
import * as WeightLoadingActions from './../store/weight-loading.actions';
import * as uiAction from '../../../shared/store/ui.actions';

import * as socketIo from 'socket.io-client';

import * as deviceParsing from './device-parsing';

import { Device, SerialPortOptions } from './device.model';
import { Observable } from 'rxjs';

const BUSINESS_ID = '0406069000354';
// const BUSINESS_ID = '0405552000249';

interface BusinessAccess {
  mode: 'auto' | 'manual';
  devices: DocumentReference[];
  device_active: DocumentReference;
}

interface WeightData {
  state: 'using' | 'active' | 'inactive';
  data: any;
}
@Injectable()
export class DeviceService {
  private SERVER_URL: string;
  private socket;
  private businessAccess: BusinessAccess = null;
  private portList: Observable<string[]>;

  private DEVICE_ACTIVE: Device = null;

  constructor(
    private store: Store<fromWeightLoading.State>,
    private afs: AngularFirestore,
    public snackBar: MatSnackBar
  ) {
    console.log('DeviceSevice active');
    store.dispatch(new uiAction.StartLoading());

    // follow device state
    this.store
      .select(fromWeightLoading.getDeviceState)
      .pipe(distinctUntilChanged())
      .subscribe(state => {
        // console.log(state);

        switch (state.state) {
          case 'manual':
            store.dispatch(new uiAction.StopLoading());
            return this.snackBar.open('Manual Mode');

          case 'try_connect':
            store.dispatch(new uiAction.StartLoading());
            return this.snackBar.open('กำลังเชื่อมต่ออุปกรณ์...');

          case 'serialport_open':
            store.dispatch(new uiAction.StopLoading());
            return this.snackBar.open('เชื่อมต่ออุปกรณ์สำเร็จ', null, { duration: 2000 });

          case 'serialport_no_data':
            return this.snackBar.open('ไม่มีข้อมูลจากอุปกรณ์', null);

          case 'reconnect':
            store.dispatch(new uiAction.StartLoading());
            return this.snackBar.open('ไม่พบเซิฟเวอร์ของอุปกรณ์ กำลังเชื่อมต่ออุปกรณ์ใหม่...');

          case 'close':
            store.dispatch(new uiAction.StartLoading());
            return this.snackBar.open('หยุดการเชื่อมต่ออุปกรณ์', null, { duration: 2000 });

          case 'port_not_found':
            store.dispatch(new uiAction.StartLoading());
            return this.snackBar
              .open('ไม่พบ Serial Port ที่ขอเชื่อมต่อ', 'รีเฟรช')
              .onAction()
              .subscribe(() => {
                this.restartDevice(
                  this.DEVICE_ACTIVE.connection_settings.local_network.serial_port_settings,
                  this.DEVICE_ACTIVE.connection_settings.local_network.client_limit
                );
              });

          case 'port_unplugged':
            store.dispatch(new uiAction.StartLoading());
            return this.snackBar
              .open('Serial Port หลุดออกจากการเชื่อมต่อ', 'รีเฟรช')
              .onAction()
              .subscribe(() => {
                this.restartDevice(
                  this.DEVICE_ACTIVE.connection_settings.local_network.serial_port_settings,
                  this.DEVICE_ACTIVE.connection_settings.local_network.client_limit
                );
              });
          // กรณีไม่มีข้อมูลใน Database
          case 'device_not_found':
            store.dispatch(new uiAction.StartLoading());
            return this.snackBar.open('ไม่พบการเชื่อมต่ออุปกรณ์', null);
        }
      });

    let connectFirstTime = true;

    // get mode from database
    this.afs
      .collection('business')
      .doc(BUSINESS_ID)
      .valueChanges()
      .subscribe((business: any) => {
        let state: { state: string; message: string } = null;

        if (business !== undefined) {
          this.businessAccess = business.weight_loading_settings;

          this.store.dispatch(new WeightLoadingActions.SetWeightLoadingMode(this.businessAccess.mode));

          if (this.businessAccess.mode === 'auto') {
            // Check Device Active
            if (this.businessAccess.device_active !== undefined) {
              const docRef = this.businessAccess.device_active;
              this.getDeviceConfig(docRef).subscribe((deviceActive: Device) => {
                // Check device in database
                if (deviceActive !== null) {
                  this.disconnectDevice();
                  this.connectDevice(deviceActive);
                } else {
                  state = { state: 'device_not_found', message: 'ไม่พบอุปกรณ์ที่เลือก' };
                  this.store.dispatch(new WeightLoadingActions.SetDeviceState(state));
                }
              });
            } else {
              this.store.dispatch(new uiAction.StartLoading());
              // ไม่มีการเลือกอุปกรณ์ในระบบ จึงทำการซุ่มเลือกอุปกรณ์ที่มีอยู่ในระบบ
              this.getDeviceList()
                .then(snap => {
                  // console.log('%c CHECK! 1 ', 'background: #222; color: #bada55');
                  if (snap.size >= 1) {
                    const min = 0;
                    const max = snap.size - 1;
                    const randomNumberOfList = Math.floor(Math.random() * (max - min + 1)) + min;
                    this.updateDeviceActive(snap.docs[randomNumberOfList].id);
                  } else {
                    const state8 = { state: 'no_device_access', message: "Your account don't have device access." };
                    this.store.dispatch(new WeightLoadingActions.SetDeviceState(state8));
                  }
                })
                .catch(err => {
                  this.snackBar.open('พบข้อผิดพลาด: ' + err, 'ปิด');
                });
            }
          } else if (this.businessAccess.mode === 'manual') {
            if (!connectFirstTime && this.businessAccess.device_active !== undefined) {
              this.disconnectDevice();
            }
            state = { state: 'manual', message: '' };
            this.store.dispatch(new WeightLoadingActions.SetDeviceState(state));
          }

          connectFirstTime = false;
        } else {
          state = { state: 'block_access', message: 'Block accress' };
          this.store.dispatch(new WeightLoadingActions.SetDeviceState(state));
          this.store.dispatch(new WeightLoadingActions.SetWeightLoadingMode('manual'));
        }
      });
  }

  private connectDevice(device: Device) {
    const local_network_setting = device.connection_settings.local_network;

    this.SERVER_URL = local_network_setting.ip_address + ':8000';
    this.DEVICE_ACTIVE = device;

    this.socket = socketIo(this.SERVER_URL);

    this.socket.on('connect', () => {
      // console.log('connect server');
      this.socket.emit('check_mac', local_network_setting.mac_address);
    });

    // check mac address เพื่อป้องกันอุปกรณ์ใช้เลข ip address
    // เหมือนกันแล้ว client สามารถเข้ามาเชื่อมต่อได้
    this.socket.on('check_mac', (access: boolean) => {
      if (access) {
        this.socket.emit('serialport_open', {
          serialport: local_network_setting.serial_port_settings,
          clientLimit: local_network_setting.client_limit
        });
      } else {
        const currentState = {
          state: 'device_not_match',
          message: 'ไม่พบอุปกรณ์ที่ลงทะเบียนไว้'
        };
        this.store.dispatch(new WeightLoadingActions.SetDeviceState(currentState));
      }
    });

    // Listen for connect
    this.socket.on('client_register', () => {
      this.socket.emit('client_register', {
        username: Math.floor(1000 + Math.random() * 9000).toString()
      });
      // this.store.dispatch(new uiAction.StopLoading());
    });

    this.socket.on('disconnect', () => {
      const state = { state: 'close', message: 'Dicconnect device' };
      this.store.dispatch(new WeightLoadingActions.SetDeviceState(state));
      // console.log('disconnect server');
    });

    // // get device state
    this.socket.on('serialport_state', (state: { state: string; message: string }) => {
      this.store.dispatch(new WeightLoadingActions.SetDeviceState(state));
      // state ของ serialport_not_config จะกระจายไปทุก client
    });

    // Checking when server don't open.
    this.socket.on('reconnecting', value => {
      // this.snackBar.open('ไม่พบเซิฟเวอร์ของอุปกรณ์ กำลังเชื่อมต่ออุปกรณ์ใหม่...');
      const currentState = {
        state: 'reconnect',
        message: "Couldn't connect device, Please check your device or network."
      };
      this.store.dispatch(new WeightLoadingActions.SetDeviceState(currentState));
    });

    this.socket.on('get_data', (res: { data: any; user: string }) => {
      const parse = local_network_setting.parse_function;
      const data = deviceParsing.parsingData(parse, res.data);
      this.store.dispatch(new WeightLoadingActions.SetDeviceData({ state: 'using', data, user: res.user }));
    });
    this.socket.on('inactive_data', (res: { data: any; user: string }) => {
      this.store.dispatch(new WeightLoadingActions.SetDeviceData({ state: 'inactive', data: null, user: res.user }));
    });

    this.socket.on('active_data', (res: { data: any; user: string }) => {
      this.store.dispatch(new WeightLoadingActions.SetDeviceData({ state: 'active', data: null, user: res.user }));
    });

    this.portList = new Observable(observer => {
      this.socket.on('list', ports => {
        observer.next(ports);
      });
      this.socket.emit('list');
    });

    const tryState = {
      state: 'try_connect',
      message: 'Connection...'
    };
    this.store.dispatch(new WeightLoadingActions.SetDeviceState(tryState));
    this.store.dispatch(new WeightLoadingActions.SetDeviceActive(device));
  }

  public disconnectDevice() {
    try {
      if (this.socket !== undefined) {
        // เช็คว่ามีการเชื่อมต่อกับ socket ของอุปกรณ์หรือไม่
        if (this.socket.connected) {
          // สั่งให้ server socket หยุดทำงานและ ยกเลิกเชื่อมต่อกับ socket
          this.socket.emit('serialport_close');
          this.socket.close();
        }
        // สั่งทำลาย socket เพื่อหยุดการ reconnection ของ client
        this.socket.destroy();
        const state = { state: 'close', message: 'Dicconnect device' };
        this.store.dispatch(new WeightLoadingActions.SetDeviceState(state));
      }
    } catch (error) {
      console.log(error);
    }
  }

  private restartDevice(
    serialport: {
      port: string;
      baud_rate: number;
      data_bits: number;
      parity: string;
      stop_bits: number;
    },
    clientLimit: number
  ) {
    this.socket.emit('serialport_restart', { serialport, clientLimit });
  }

  public getDeviceConfig(deviceRef: DocumentReference): Observable<Device> {
    return this.afs
      .doc<Device>(deviceRef.path)
      .snapshotChanges()
      .pipe(
        map(d => {
          const id = d.payload.id;
          const data = d.payload.data();
          // check device not found
          if (data !== undefined) {
            return { id: id, ...data };
          } else {
            return null;
          }
        })
      );
  }

  public updateDatabaseWeightLoadingMode(mode: 'auto' | 'manual') {
    this.afs
      // .collection('features/weight_loading/business')
      .collection('business')
      .doc(BUSINESS_ID)
      .update({ 'weight_loading_settings.mode': mode })
      .then(() => {
        this.store.dispatch(new WeightLoadingActions.SetWeightLoadingMode(mode));
      })
      .catch(error => {
        this.snackBar.open('พบข้อผิดพลาด: ' + error, 'ปิด');
      });
  }

  // ยังไม่ทดสอบ
  public updateDeviceActive(id: string): Promise<void> {
    this.store.dispatch(new uiAction.StartLoading());
    return this.afs.firestore.runTransaction(t => {
      return this.getDeviceList()
        .then(snap => {
          snap.forEach(doc => {
            if (doc.id === id) {
              const businessRef = this.afs.firestore.collection('business').doc(BUSINESS_ID);
              const deviceRef: DocumentReference = this.afs.collection('devices').doc(doc.id).ref;
              t.update(businessRef, { 'weight_loading_settings.device_active': deviceRef });
            }
          });
          this.store.dispatch(new uiAction.StopLoading());
        })
        .catch(err => {
          this.store.dispatch(new uiAction.StopLoading());
          this.snackBar.open('พบข้อผิดพลาด: ' + err, 'ปิด');
        });
    });
  }

  public saveDeviceConfig(
    device: Device,
    serialport: { port: string; option: SerialPortOptions },
    clientLimit: number,
    parseFunction: string
  ): Promise<void> {
    this.store.dispatch(new uiAction.StartLoading());

    const batch = this.afs.firestore.batch();
    const deviceRef = this.afs.firestore.collection('devices').doc(device.id);
    batch.update(deviceRef, {
      'connection_settings.local_network': {
        ip_address: device.connection_settings.local_network.ip_address,
        client_limit: clientLimit,
        parse_function: parseFunction,
        serial_port_settings: {
          port: serialport.port,
          baud_rate: serialport.option.baud_rate,
          data_bits: serialport.option.data_bits,
          parity: serialport.option.parity,
          stop_bits: serialport.option.stop_bits
        }
      }
    });
    return batch
      .commit()
      .then(() => {
        this.restartDevice(
          device.connection_settings.local_network.serial_port_settings,
          device.connection_settings.local_network.client_limit
        );
        this.store.dispatch(new uiAction.StopLoading());
      })
      .catch(err => {
        this.store.dispatch(new uiAction.StopLoading());
        this.snackBar.open('พบข้อผิดพลาด: ' + err, 'ปิด');
      });
  }

  public getDeviceList(): Promise<any> {
    const businesRef: DocumentReference = this.afs.collection('business').doc(BUSINESS_ID).ref;
    const deviceListRef = this.afs.firestore.collection('devices').where('activated.business_ref', '==', businesRef);
    return deviceListRef.get();
  }

  public getPortList(): Observable<string[]> {
    return this.portList;
  }

  public rescanSerialPortList() {
    if (this.businessAccess.device_active !== undefined) {
      this.socket.emit('list');
    }
  }

  public reserveData() {
    // if (this.businessAccess.mode === 'auto') {
    this.socket.emit('reserve_data');
    // }
  }
  public cancelReserveData() {
    // if (this.businessAccess.mode === 'auto') {
    this.socket.emit('cancel_reserve_data');
    // }
  }
}
