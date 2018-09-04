import { ConnectWeightDeviceComponent } from './connect-weight-device/connect-weight-device.component';
import { MatDialog } from '@angular/material';
import { Component, OnInit } from '@angular/core';
import * as fromWeightLoading from './store/weight-loading.reducer';
import { Store } from '@ngrx/store';

@Component({
  selector: 'tst-weight-loading',
  templateUrl: './weight-loading.component.html',
  styleUrls: ['./weight-loading.component.scss']
})
export class WeightLoadingComponent implements OnInit {
  showRoute = null;

  constructor(private dialog: MatDialog, private store: Store<fromWeightLoading.State>) {
    this.store.select(fromWeightLoading.getRoute).subscribe(
      res => {
        // console.log(res);
        res !== null ? (this.showRoute = res) : (this.showRoute = null);
      },
      error => console.log(error)
    );
  }

  ngOnInit() {}

  // onSettingDevice(){
  //   const dialogSetting = this.dialog.open(ConnectWeightDeviceComponent,{
  //     width: '90%',
  //     maxWidth: '500px',
  //     // autoFocus: true,
  //     disableClose: false
  //   })
  // }
}
