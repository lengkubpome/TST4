import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'tst-add-weight-device',
  templateUrl: './add-weight-device.component.html',
  styleUrls: ['./add-weight-device.component.scss'],
})
export class AddWeightDeviceComponent implements OnInit {
  addDeviceForm: FormGroup;

  @Output() addDevice = new EventEmitter<boolean>();

  constructor(private fb: FormBuilder) {
    this.addDeviceForm = this.fb.group({
      model: [{ value: '', disabled: false }, Validators.required],
      connect_mode: [{ value: 'local_network', disabled: true }]
    });
  }

  ngOnInit() {}

  onSubmitAddDevice() {}
  onCancelAddDevice() {
    this.addDeviceForm.get('model').setValue('');
    this.addDeviceForm.get('connect_mode').setValue('');
    this.addDevice.emit(false);
  }
}
