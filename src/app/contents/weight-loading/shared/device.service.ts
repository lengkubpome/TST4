import { MatSnackBar } from '@angular/material';
import { map, take, distinctUntilChanged } from 'rxjs/operators';
import { Injectable } from '@angular/core';

import { AngularFirestore, DocumentReference } from 'angularfire2/firestore';

import { Store } from '@ngrx/store';
import * as fromWeightLoading from './../store/weight-loading.reducer';
import * as WeightLoadingActions from './../store/weight-loading.actions';

import * as socketIo from 'socket.io-client';

import { Device, SerialPortOptions } from './device.model';
import { Observable } from 'rxjs';

const BUSINESS_ID = '0403549000606';
// const BUSINESS_ID = '0405552000249';

interface BusinessAccess {
  mode: 'auto' | 'manual';
  devices: DocumentReference[];
  device_active: DocumentReference;
}
@Injectable()
export class DeviceService {
  private SERVER_URL: string;
  private socket;
  private businessAccess: BusinessAccess;
  private deviceList: Device[] = [];
  private portList: Observable<string[]>;
  // private resource: 'using' | 'active' | 'inactive' = 'inactive';
  private resource: Observable<{ state: 'using' | 'active' | 'inactive'; data: any }>;

  constructor(
    private store: Store<fromWeightLoading.State>,
    private afs: AngularFirestore,
    public snackBar: MatSnackBar
  ) {
    console.log('DeviceSevice active');

    // follow device state
    this.store
      .select(fromWeightLoading.getDeviceState)
      .pipe(distinctUntilChanged())
      .subscribe(state => {
        console.log(state);

        switch (state.state) {
          case 'try_connect':
            return this.snackBar.open('กำลังเชื่อมต่ออุปกรณ์...');
          case 'serialport_open':
            return this.snackBar.open('เชื่อมต่ออุปกรณ์สำเร็จ', null, { duration: 2000 });
          case 'serialport_no_data':
            return this.snackBar.open('ไม่มีข้อมูลจาก Serialport', null);
          case 'reconnect':
            return this.snackBar.open('ไม่พบเซิฟเวอร์ของอุปกรณ์ กำลังเชื่อมต่ออุปกรณ์ใหม่...');
          case 'close':
            return this.snackBar.open('หยุดการเชื่อมต่ออุปกรณ์', null, { duration: 2000 });
          case 'port_not_found':
            return this.snackBar.open('ไม่พบ Serial Port ที่ขอเชื่อมต่อ', 'รีเฟรช');
          case 'port_unplugged':
            return this.snackBar.open('Serial Port หลุดออกจากการเชื่อมต่อ', 'รีเฟรช');
        }
      });

    let connectFirstTime = true;
    // get mode from database
    this.afs
      .collection('features/weight_loading/business')
      .doc(BUSINESS_ID)
      .valueChanges()
      .subscribe((result: any) => {
        if (result !== undefined) {
          this.businessAccess = result;

          // Collect Device list
          this.deviceList = [];
          this.businessAccess.devices.forEach((deviceRef: DocumentReference) => {
            this.getDeviceConfig(deviceRef)
              .pipe(take(1))
              .subscribe((d: Device) => {
                if (d !== null) this.deviceList.push(d);
              });
          });

          this.store.dispatch(new WeightLoadingActions.SetWeightLoadingMode(this.businessAccess.mode));

          if (this.businessAccess.mode === 'auto') {
            // Check Device Active
            if (this.businessAccess.device_active !== undefined) {
              const docRef = this.businessAccess.device_active;
              this.getDeviceConfig(docRef).subscribe((deviceActive: Device) => {
                // Check device in database
                if (deviceActive !== null) {
                  // ตรวจเช็คว่ามีการสร้าง socket ที่ยังเชื่อมต่ออยู่
                  if (this.socket !== undefined) {
                    // สั่งทำลาย socket เพื่อหยุดการ reconnection ของ client
                    this.socket.destroy();
                    const state = { state: 'close', message: 'Dicconnect device' };
                    this.store.dispatch(new WeightLoadingActions.SetDeviceState(state));
                  }

                  this.connectDevice(deviceActive);
                } else {
                  // console.log('Device not found');
                  const state = { state: 'device_not_found', message: 'Device not found' };
                  this.store.dispatch(new WeightLoadingActions.SetDeviceState(state));
                }
              });
            } else {
              if (this.businessAccess.devices.length > 0) {
                // ไม่มีการเลือกอุปกรณ์ในระบบ จึงทำการซุ่มเลือกอุปกรณ์ที่มีอยู่ในระบบ
                const min = 0;
                const max = this.businessAccess.devices.length - 1;
                const randomNumberOfList = Math.floor(Math.random() * (max - min + 1)) + min;
                const id = this.businessAccess.devices[randomNumberOfList].id;
                this.updateDeviceActive(id);
              } else {
                const state = { state: 'no_device_access', message: "Your account don't have device access." };
                this.store.dispatch(new WeightLoadingActions.SetDeviceState(state));
              }
            }
          } else if (!connectFirstTime && this.businessAccess.device_active !== undefined) {
            this.disconnectDevice();
          }

          connectFirstTime = false;
        } else {
          const currentState = { state: 'block_access', message: 'Block accress' };
          this.store.dispatch(new WeightLoadingActions.SetDeviceState(currentState));
          this.store.dispatch(new WeightLoadingActions.SetWeightLoadingMode('manual'));
        }
      });
  }

  private connectDevice(device: Device) {
    this.SERVER_URL = device.ip_address + ':8000';

    this.socket = socketIo(this.SERVER_URL);

    this.socket.on('connect', () => {
      console.log('connect server');
      this.socket.emit('check_mac', device.mac_address);
    });

    // check mac address เพื่อป้องกันอุปกรณ์ใช้เลข ip address
    // เหมือนกันแล้ว client สามารถเข้ามาเชื่อมต่อได้
    this.socket.on('check_mac', (access: boolean) => {
      if (access) {
        this.socket.emit('serialport_open', {
          serialport: device.serial_port,
          clientLimit: device.client_limit
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
    });

    this.socket.on('disconnect', () => {
      const state = { state: 'close', message: 'Dicconnect device' };
      this.store.dispatch(new WeightLoadingActions.SetDeviceState(state));
      console.log('disconnect server');
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

    this.resource = new Observable<{ state: 'using' | 'active' | 'inactive'; data: any }>(observer => {

      this.socket.on('get_data', data => {
        observer.next({ state: 'using', data });
      });
      this.socket.on('inactive_data', () => {
        observer.next({ state: 'inactive', data: null });
      });

      this.socket.on('active_data', user => {
        observer.next({ state: 'active', data: null });
      });
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

  public getDeviceConfig(deviceRef: DocumentReference): Observable<Device> {
    return this.afs
      .doc<any>(deviceRef.path)
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

  public changeWeightLoadingMode(mode: string) {
    this.updateDatabaseWeightLoadingMode(mode);
  }

  private updateDatabaseWeightLoadingMode(mode: string) {
    this.afs
      .collection('features/weight_loading/business')
      .doc(BUSINESS_ID)
      .update({ mode })
      .then(() => {
        // this.snackBar.open('ระบบได้เปลี่ยนรูปแบบการรับค่าน้ำหนัก', 'ปิด');
      })
      .catch(error => {
        this.snackBar.open('พบข้อผิดพลาด: ' + error, 'ปิด');
      });
  }

  public changeDeviceActive(id: string) {
    this.updateDeviceActive(id);
  }

  private updateDeviceActive(id: string) {
    this.businessAccess.devices.forEach((device: DocumentReference) => {
      if (device.id === id) {
        this.afs
          .collection('features/weight_loading/business')
          .doc(BUSINESS_ID)
          .update({ device_active: device })
          .then(() => {})
          .catch(error => {
            this.snackBar.open('พบข้อผิดพลาด: ' + error, 'ปิด');
          });
      }
    });
  }

  public SaveDeviceConfig(device: Device, serialport: { port: string; option: SerialPortOptions }) {
    this.afs
      .collection('devices')
      .doc(device.id)
      .update({
        serial_port: {
          port: serialport.port,
          baud_rate: serialport.option.baud_rate,
          data_bits: serialport.option.data_bits,
          parity: serialport.option.parity,
          stop_bits: serialport.option.stop_bits
        }
      })
      .then(() => {
        // ส่งคำร้องให้ทาง server หยุดเชื่อมต่อ serialport
        this.socket.emit('serialport_close');
      })
      .catch(error => {
        this.snackBar.open('พบข้อผิดพลาด: ' + error, 'ปิด');
      });
  }

  public getDeviceList(): Device[] {
    return this.deviceList;
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
    this.socket.emit('reserve_data');
  }
  public cancelReserveData() {
    this.socket.emit('cancel_reserve_data');
  }

  public getData(): Observable<{ state: 'using' | 'active' | 'inactive'; data: any }> {
    return this.resource;
  }
}
