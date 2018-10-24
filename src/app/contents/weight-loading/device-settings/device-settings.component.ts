import { DeviceService } from '../shared/device.service';
import { Device, Serial_Port_Options, SerialPortOptions } from '../shared/device.model';
import { Store } from '@ngrx/store';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import * as fromWeightLoading from '../store/weight-loading.reducer';
import * as weightLoadingAction from '../store/weight-loading.actions';

import { Parse_Functions } from '../shared/device-parsing';

@Component({
  selector: 'tst-device-settings',
  templateUrl: './device-settings.component.html',
  styleUrls: ['./device-settings.component.scss']
})
export class DeviceSettingsComponent implements OnInit, OnDestroy {
  deviceConnectionForm: FormGroup;
  deviceConfigForm: FormGroup;

  weightLoadingMode: 'auto' | 'manual';

  deviceList: Device[];
  serialPortOptions: SerialPortOptions = Serial_Port_Options;
  ports: string[] = [];
  parseFunctions = Parse_Functions;

  deviceActive: Device;
  deviceState: { state: string; message: string };
  deviceDataState: string;

  addDevice = false;
  editDevice = false;
  editDeviceConfig = false;

  modeSubscribtion: Subscription = new Subscription();
  deviceActiveSubscribtion: Subscription = new Subscription();
  deviceDataSubscribtion: Subscription = new Subscription();
  stateSubscribtion: Subscription = new Subscription();

  constructor(
    private store: Store<fromWeightLoading.State>,
    private deviceService: DeviceService,
    private fb: FormBuilder
  ) {
    this.deviceConnectionForm = this.fb.group({
      machine_model: [{ value: '', disabled: true }, Validators.required],
      connect_mode: [{ value: '', disabled: true }]
    });

    this.deviceConfigForm = this.fb.group({
      port: [{ value: '', disabled: true }, Validators.required],
      baud_rate: [{ value: '', disabled: true }, Validators.required],
      data_bits: [{ value: '', disabled: true }, Validators.required],
      parity: [{ value: '', disabled: true }, Validators.required],
      stop_bits: [{ value: '', disabled: true }, Validators.required],
      client_limit: [{ value: '', disabled: true }, Validators.required],
      parse_function: [{ value: '', disabled: true }, Validators.required],
      receive_data: [{ value: '', disabled: true }]
    });

    //set route
    this.store.dispatch(new weightLoadingAction.SetRoute('settings-device'));
  }

  ngOnInit() {
    // follow device state
    this.stateSubscribtion = this.store
      .select(fromWeightLoading.getDeviceState)
      .pipe(distinctUntilChanged())
      .subscribe(state => {
        this.deviceState = state;
        // console.log(state);
      });

    // follow mode
    this.modeSubscribtion = this.store.select(fromWeightLoading.getMode).subscribe((mode: 'auto' | 'manual') => {
      this.weightLoadingMode = mode;
      // console.log('Mode action');

      if (mode === 'auto') {
        this.deviceActiveSubscribtion = this.store.select(fromWeightLoading.getDeviceActive).subscribe(deviceActive => {

          // get device list
          this.deviceService
            .getDeviceList()
            .then(snapshot => {
              this.deviceList = [];
              snapshot.forEach(doc => {
                const data = { id: doc.id, ...doc.data() };
                this.deviceList = [...this.deviceList, data];
              });
            })
            .catch(err => {
              console.log('Error getting device list', err);
            });

          // ล้างต่าการ subscribe ก่อนที่เริ่มรับใหม่
          this.deviceDataSubscribtion.unsubscribe();
          // เช็คกรณีไม่มีการตั้งค่าอุปกรณ์ไว้
          if (deviceActive !== null) {
            this.deviceActive = deviceActive;

            this.setDeviceConnectionForm(deviceActive);
            // follow data from device
            this.deviceDataSubscribtion = this.store
              .select(fromWeightLoading.getDeviceData)
              .pipe(distinctUntilChanged())
              .subscribe(res => {
                this.deviceDataState = res.state;
                if (res.state === 'using') {
                  this.deviceConfigForm.get('receive_data').setValue(JSON.stringify(res.data));
                } else if (res.state === 'inactive') {
                  this.deviceConfigForm.get('receive_data').setValue('Ready');
                } else {
                  this.deviceConfigForm.get('receive_data').setValue('Someone is using');
                }
              });
          } else {
            // จัดการเรื่องไม่มีอุปกรณ์
            this.resetDeviceConnectionForm();
            this.resetDeviceConfigForm();
          }
        });
      } else if (mode === 'manual') {
        this.deviceActiveSubscribtion.unsubscribe();
        this.resetDeviceConnectionForm();
        this.resetDeviceConfigForm();
      }
    });
  }

  onChangeWeightLoadingMode() {
    this.deviceService.updateDatabaseWeightLoadingMode(this.weightLoadingMode);
  }

  ngOnDestroy() {
    this.modeSubscribtion.unsubscribe();
    this.deviceActiveSubscribtion.unsubscribe();
    this.stateSubscribtion.unsubscribe();
    this.deviceDataSubscribtion.unsubscribe();
    // ยกเลิกการทดสอบค่า
    if (this.weightLoadingMode === 'auto') {
      this.deviceService.cancelReserveData();
    }
  }

  // ==== Device Connection ====
  setDeviceConnectionForm(device: Device) {
    if (device !== undefined) {
      this.deviceConnectionForm.get('machine_model').setValue(device.id);
      this.deviceConnectionForm.get('connect_mode').setValue('local_network');

      // add serialport list
      this.deviceService.getPortList().subscribe(port => {
        this.ports = port;
      });

      // เช็คการตั้งค่า Serialport Option
      this.setDeviceConfigForm(device);
    } else {
      this.resetDeviceConnectionForm();
    }
  }

  resetDeviceConnectionForm() {
    this.deviceConnectionForm.get('machine_model').setValue('');
    this.deviceConnectionForm.get('connect_mode').setValue('');

    this.deviceConnectionForm.get('machine_model').disable();
    this.deviceConnectionForm.get('connect_mode').disable();

    this.editDevice = false;
  }

  onEditDeviceConnectionForm() {
    this.editDevice = true;
    this.deviceConnectionForm.get('machine_model').enable();
    // this.deviceSettingForm.get('connect_mode').enable();
  }

  onSaveDeviceConnectionForm() {
    const id = this.deviceConnectionForm.get('machine_model').value;
    // กรณีไม่มีค่า deviceActive
    if (this.deviceActive !== undefined) {
      // ตรวจเช็คค่าไม่เปลี่ยนแปลง
      if (this.deviceActive.id !== id) {
        this.deviceService.updateDeviceActive(id);
      } else {
        // คืนค่าเดิม
        this.setDeviceConnectionForm(this.deviceActive);
      }
    } else {
      this.deviceService.updateDeviceActive(id);
    }

    this.deviceConnectionForm.get('machine_model').disable();
    this.deviceConnectionForm.get('connect_mode').disable();
    this.editDevice = false;
  }

  onCancelDeviceConnectionForm() {
    this.setDeviceConnectionForm(this.deviceActive);
    this.deviceConnectionForm.get('machine_model').disable();
    this.deviceConnectionForm.get('connect_mode').disable();
    this.editDevice = false;
  }

  // ==== END Device Connection ====

  //===== Config Serial Port ========
  setDeviceConfigForm(device: Device) {
    const settings = device.connection_settings.local_network;
    if (settings.serial_port_settings !== undefined) {
      this.deviceConfigForm.get('port').setValue(settings.serial_port_settings.port);
      this.deviceConfigForm.get('baud_rate').setValue(settings.serial_port_settings.baud_rate);
      this.deviceConfigForm.get('data_bits').setValue(settings.serial_port_settings.data_bits);
      this.deviceConfigForm.get('parity').setValue(settings.serial_port_settings.parity);
      this.deviceConfigForm.get('stop_bits').setValue(settings.serial_port_settings.stop_bits);
      // settings
      this.deviceConfigForm.get('client_limit').setValue(settings.client_limit);
      this.deviceConfigForm.get('parse_function').setValue(settings.parse_function);
    } else {
      this.resetDeviceConfigForm();
    }
  }

  resetDeviceConfigForm() {
    this.deviceConfigForm.get('port').setValue('');
    this.deviceConfigForm.get('baud_rate').setValue('');
    this.deviceConfigForm.get('data_bits').setValue('');
    this.deviceConfigForm.get('parity').setValue('');
    this.deviceConfigForm.get('stop_bits').setValue('');
    this.deviceConfigForm.get('stop_bits').setValue('');
    this.deviceConfigForm.get('client_limit').setValue('');
    this.deviceConfigForm.get('parse_function').setValue('');
    // this.deviceConfigForm.get('receive_data').setValue('');

    this.deviceConfigForm.get('port').disable();
    this.deviceConfigForm.get('baud_rate').disable();
    this.deviceConfigForm.get('data_bits').disable();
    this.deviceConfigForm.get('parity').disable();
    this.deviceConfigForm.get('stop_bits').disable();
    this.deviceConfigForm.get('client_limit').disable();
    this.deviceConfigForm.get('parse_function').disable();

    this.editDeviceConfig = false;
  }
  //===== END Config Serial Port ========

  onEditDeviceConfigForm() {
    this.deviceService.rescanSerialPortList();

    this.deviceConfigForm.get('port').enable();
    this.deviceConfigForm.get('baud_rate').enable();
    this.deviceConfigForm.get('data_bits').enable();
    this.deviceConfigForm.get('parity').enable();
    this.deviceConfigForm.get('stop_bits').enable();
    this.deviceConfigForm.get('client_limit').enable();
    this.deviceConfigForm.get('parse_function').enable();

    this.editDeviceConfig = true;
  }
  onCancelDeviceConfigForm() {
    this.deviceConfigForm.get('port').disable();
    this.deviceConfigForm.get('baud_rate').disable();
    this.deviceConfigForm.get('data_bits').disable();
    this.deviceConfigForm.get('parity').disable();
    this.deviceConfigForm.get('stop_bits').disable();
    this.deviceConfigForm.get('client_limit').disable();
    this.deviceConfigForm.get('parse_function').disable();
    this.deviceConfigForm.reset();
    this.editDeviceConfig = false;

    this.setDeviceConfigForm(this.deviceActive);
  }

  onSaveDeviceConfigForm() {
    this.deviceConfigForm.get('port').disable();
    this.deviceConfigForm.get('baud_rate').disable();
    this.deviceConfigForm.get('data_bits').disable();
    this.deviceConfigForm.get('parity').disable();
    this.deviceConfigForm.get('stop_bits').disable();
    this.deviceConfigForm.get('client_limit').disable();
    this.deviceConfigForm.get('parse_function').disable();

    const port = this.deviceConfigForm.get('port').value;
    const option: SerialPortOptions = {
      baud_rate: this.deviceConfigForm.get('baud_rate').value,
      data_bits: this.deviceConfigForm.get('data_bits').value,
      parity: this.deviceConfigForm.get('parity').value,
      stop_bits: this.deviceConfigForm.get('stop_bits').value
    };
    const serialport = { port, option };
    const clientLimit = this.deviceConfigForm.get('client_limit').value;
    const parseFunction = this.deviceConfigForm.get('parse_function').value;

    this.deviceService.saveDeviceConfig(this.deviceActive, serialport, clientLimit, parseFunction);
    // กรณีบันทึกข้อมูลเสร็จสมบูรณ์
    this.editDeviceConfig = false;
  }

  onAddDevice() {
    this.addDevice = true;
    this.onCancelDeviceConfigForm();
    this.onCancelDeviceConnectionForm();
  }

  onRescanPort(): void {
    this.deviceService.rescanSerialPortList();
  }

  onReserveData() {
    this.deviceService.reserveData();
  }
  onCancelReserveData() {
    this.deviceService.cancelReserveData();
  }

  // private settingForm(boolean: boolean) {
  //   Object.keys(this.deviceSettingForm.controls).forEach(key => {
  //     const notEnable = ['mode', 'connect_mode'];
  //     if (!notEnable.includes(key)) {
  //       if (boolean) {
  //         this.deviceSettingForm.get(key).enable();
  //       } else {
  //         this.deviceSettingForm.get(key).disable();
  //       }
  //     }
  //   });
  // }
}
