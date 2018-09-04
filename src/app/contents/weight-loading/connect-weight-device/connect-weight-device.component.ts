import { DeviceService } from './../shared/device.service';
import { Device, SerialPortOptions } from './../shared/device.model';
import { Store } from '@ngrx/store';
import { Component, OnInit } from '@angular/core';

import * as fromWeightLoading from '../store/weight-loading.reducer';
import * as weightLoadingAction from '../store/weight-loading.actions';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

const Serial_Port_Options: SerialPortOptions = {
  buad_rate: [300, 600, 1200, 1800, 2400, 3600, 4800, 7200, 9600, 14400, 19200, 28800, 38400, 57600, 115200, 230400],
  data_bits: [5, 6, 7, 8],
  parity: ['none', 'odd', 'even'],
  stop_bits: [1, 1.5, 2]
};

@Component({
  selector: 'tst-connect-weight-device',
  templateUrl: './connect-weight-device.component.html',
  styleUrls: ['./connect-weight-device.component.scss']
})
export class ConnectWeightDeviceComponent implements OnInit {
  deviceSettingForm: FormGroup;
  serialPortOptions: SerialPortOptions = Serial_Port_Options;
  portList: string[] = ['/dev/tty.usbserial-FTA573YH', 'option1', 'option2'];
  weightLoadingMode: 'auto' | 'manual';
  editDevice = false;

  device: Device;

  constructor(private store: Store<fromWeightLoading.State>,
    private deviceService: DeviceService,
    private fb: FormBuilder) {
    //set route 
    this.store.dispatch(new weightLoadingAction.SetRoute('settings-device'));

    this.store.select(fromWeightLoading.getMode).subscribe(
      mode => this.weightLoadingMode = mode
    );

    this.device = {
      model: 'TST',
      device_mode: 'local',
      mac_address: '78:4f:43:5b:37:66',
      parsing: 'TSTParsing',
      status: {
        state: '',
        mesages: 'ขณะนี้ได้ติดต่อกับอุปกรณ์เรียบร้อย โดยมีช่องทาง IP Address 192.168.1.12'
      },
      serial_port: {
        port: '/dev/tty.usbserial-FTA573YH',
        buad_rate: 4800,
        data_bits: 5,
        parity: 'even',
        stop_bits: 1
      }
    };
  }

  ngOnInit() {

    this.deviceSettingForm = this.fb.group({
      model: [{ value: this.device.model, disabled: true }, Validators.required],
      device_mode: [{ value: this.device.device_mode, disabled: true }, Validators.required],
      mac_address: [{ value: this.device.mac_address, disabled: true }, Validators.required],
      port: [{ value: this.device.serial_port.port, disabled: true }, Validators.required],
      buad_rate: [{ value: this.device.serial_port.buad_rate, disabled: true }, Validators.required],
      data_bits: [{ value: this.device.serial_port.data_bits, disabled: true }, Validators.required],
      parity: [{ value: this.device.serial_port.parity, disabled: true }, Validators.required],
      stop_bits: [{ value: this.device.serial_port.stop_bits, disabled: true }, Validators.required],
      function: [{ value: this.device.parsing, disabled: true }, Validators.required],
      receive_data: [{ value: '', disabled: true }, Validators.required],

    });


  }
  onChangeWeightLoadingMode() {
    this.store.dispatch(new weightLoadingAction.SetWeightLoadingMode(this.weightLoadingMode))
    if (this.weightLoadingMode === 'auto') {
      // this.deviceService.initSocket();
    }

  }

  onEditDevice() {
    this.editDevice = true;
    // Enable Form
    this.settingForm(true);
  }

  onSaveDeviceMode() {
    this.editDevice = false;

    // Disabled Form
    this.settingForm(false);
  }
  onCancelDeviceMode() {
    this.editDevice = false;

    // Disabled Form
    this.settingForm(false);
  }

  private settingForm(boolean: boolean) {
    Object.keys(this.deviceSettingForm.controls).forEach(key => {
      const notEnable = ['device_mode', 'model'];
      if (!notEnable.includes(key)) {
        boolean ?
          this.deviceSettingForm.get(key).enable() :
          this.deviceSettingForm.get(key).disable()
      }
    });
  }

  onRescanPort() {
    console.log('get port');

  }


}
