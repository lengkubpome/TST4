import { DeviceService } from './../shared/device.service';
import { Device, Serial_Port_Options, SerialPortOptions } from './../shared/device.model';
import { Store } from '@ngrx/store';
import { Component, OnInit, OnDestroy } from '@angular/core';

import * as fromWeightLoading from '../store/weight-loading.reducer';
import * as weightLoadingAction from '../store/weight-loading.actions';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'tst-connect-weight-device',
  templateUrl: './connect-weight-device.component.html',
  styleUrls: ['./connect-weight-device.component.scss']
})
export class ConnectWeightDeviceComponent implements OnInit, OnDestroy {
  deviceConnectionForm: FormGroup;
  deviceConfigForm: FormGroup;

  weightLoadingMode: string;

  deviceList: Device[];
  serialPortOptions: SerialPortOptions = Serial_Port_Options;
  ports: string[] = [];

  deviceActive: Device;
  deviceState: { state: string; message: string };

  addDevice = false;
  editDevice = false;
  editDeviceConfig = false;

  resource: any = null;

  modeSubscribtion: Subscription = new Subscription();
  deviceActiveSubscribtion: Subscription = new Subscription();
  stateSubscribtion: Subscription = new Subscription();

  constructor(
    private store: Store<fromWeightLoading.State>,
    private deviceService: DeviceService,
    private fb: FormBuilder
  ) {
    this.deviceConnectionForm = this.fb.group({
      model: [{ value: '', disabled: true }, Validators.required],
      connect_mode: [{ value: '', disabled: true }]
    });

    this.deviceConfigForm = this.fb.group({
      port: [{ value: '', disabled: true }, Validators.required],
      baud_rate: [{ value: '', disabled: true }, Validators.required],
      data_bits: [{ value: '', disabled: true }, Validators.required],
      parity: [{ value: '', disabled: true }, Validators.required],
      stop_bits: [{ value: '', disabled: true }, Validators.required],
      function: [{ value: '', disabled: true }],
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
        console.log(state);
      });

    // follow mode
    this.modeSubscribtion = this.store.select(fromWeightLoading.getMode).subscribe(mode => {
      this.weightLoadingMode = mode;
      console.log('Mode action');

      if (mode === 'auto') {
        this.deviceActiveSubscribtion = this.store.select(fromWeightLoading.getDeviceActive).subscribe(deviceActive => {
          // get device list
          this.deviceList = this.deviceService.getDeviceList();
          // เช็คกรณีไม่มีการตั้งค่าอุปกรณ์ไว้
          if (deviceActive !== null) {
            this.deviceActive = deviceActive;

            this.setDeviceConnectionForm(deviceActive);

            // follow data from device
            this.deviceService.getData().subscribe(res => {
              if (res.state === 'using') {
                this.resource = this.resource + '\n' + res.data;
                this.deviceConfigForm.get('receive_data').setValue(this.resource);
                // console.log(this.resource);
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
    this.deviceService.changeWeightLoadingMode(this.weightLoadingMode);
  }

  ngOnDestroy() {
    this.modeSubscribtion.unsubscribe();
    this.deviceActiveSubscribtion.unsubscribe();
    this.stateSubscribtion.unsubscribe();
    console.log('Component Destroy');
  }

  // ==== Device Connection ====
  setDeviceConnectionForm(device: Device) {
    if (device !== undefined) {
      this.deviceConnectionForm.get('model').setValue(device.id);
      this.deviceConnectionForm.get('connect_mode').setValue(device.connect_mode);

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
    this.deviceConnectionForm.get('model').setValue('');
    this.deviceConnectionForm.get('connect_mode').setValue('');

    this.deviceConnectionForm.get('model').disable();
    this.deviceConnectionForm.get('connect_mode').disable();

    this.editDevice = false;
  }

  onEditDeviceConnectionForm() {
    this.editDevice = true;
    this.deviceConnectionForm.get('model').enable();
    // this.deviceSettingForm.get('connect_mode').enable();
  }

  onSaveDeviceConnectionForm() {
    const id = this.deviceConnectionForm.get('model').value;
    // กรณีไม่มีค่า deviceActive
    if (this.deviceActive !== undefined) {
      // ตรวจเช็คค่าไม่เปลี่ยนแปลง
      if (this.deviceActive.id !== id) {
        this.deviceService.changeDeviceActive(id);
      } else {
        // คืนค่าเดิม
        this.setDeviceConnectionForm(this.deviceActive);
      }
    } else {
      this.deviceService.changeDeviceActive(id);
    }

    this.deviceConnectionForm.get('model').disable();
    this.deviceConnectionForm.get('connect_mode').disable();
    this.editDevice = false;
  }

  onCancelDeviceConnectionForm() {
    this.setDeviceConnectionForm(this.deviceActive);
    this.deviceConnectionForm.get('model').disable();
    this.deviceConnectionForm.get('connect_mode').disable();
    this.editDevice = false;
  }

  // ==== END Device Connection ====

  //===== Config Serial Port ========
  setDeviceConfigForm(device: Device) {
    if (device.serial_port !== undefined) {
      this.deviceConfigForm.get('port').setValue(device.serial_port.port);
      this.deviceConfigForm.get('baud_rate').setValue(device.serial_port.baud_rate);
      this.deviceConfigForm.get('data_bits').setValue(device.serial_port.data_bits);
      this.deviceConfigForm.get('parity').setValue(device.serial_port.parity);
      this.deviceConfigForm.get('stop_bits').setValue(device.serial_port.stop_bits);
      // function
      this.deviceConfigForm.get('function').setValue(device.parse_function);
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

    this.deviceConfigForm.get('port').disable();
    this.deviceConfigForm.get('baud_rate').disable();
    this.deviceConfigForm.get('data_bits').disable();
    this.deviceConfigForm.get('parity').disable();
    this.deviceConfigForm.get('stop_bits').disable();
    this.deviceConfigForm.get('stop_bits').disable();
    this.deviceConfigForm.get('function').disable();

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
    this.deviceConfigForm.get('stop_bits').enable();
    this.deviceConfigForm.get('function').enable();

    this.editDeviceConfig = true;
  }
  onCancelDeviceConfigForm() {
    this.deviceConfigForm.get('port').disable();
    this.deviceConfigForm.get('baud_rate').disable();
    this.deviceConfigForm.get('data_bits').disable();
    this.deviceConfigForm.get('parity').disable();
    this.deviceConfigForm.get('stop_bits').disable();
    this.deviceConfigForm.get('stop_bits').disable();
    this.deviceConfigForm.get('function').disable();
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
    this.deviceConfigForm.get('function').disable();

    const port = this.deviceConfigForm.get('port').value;
    const option: SerialPortOptions = {
      baud_rate: this.deviceConfigForm.get('baud_rate').value,
      data_bits: this.deviceConfigForm.get('data_bits').value,
      parity: this.deviceConfigForm.get('parity').value,
      stop_bits: this.deviceConfigForm.get('stop_bits').value
    };

    this.deviceService.SaveDeviceConfig(this.deviceActive, { port, option });
    // กรณีบันทึกข้อมูลเสร็จสมบูรณ์
    this.editDeviceConfig = false;
    // this.setDeviceConfigForm(this.deviceActive);
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
