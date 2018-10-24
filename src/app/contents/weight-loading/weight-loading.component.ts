import { MatDialog } from '@angular/material';
import { Component, OnInit } from '@angular/core';
import * as fromWeightLoading from './store/weight-loading.reducer';
import { Store } from '@ngrx/store';
import { DeviceService } from './shared/device.service';

import * as fromApp from '../../app.reducer';

@Component({
  selector: 'tst-weight-loading',
  templateUrl: './weight-loading.component.html',
  styleUrls: ['./weight-loading.component.scss']
})
export class WeightLoadingComponent implements OnInit {
  showRoute = null;
  isLoading: boolean;

  constructor(private store: Store<fromWeightLoading.State>, private deviceService: DeviceService) {
    this.store.select(fromWeightLoading.getRoute).subscribe(
      res => {
        // console.log(res);
        res !== null ? (this.showRoute = res) : (this.showRoute = null);
      },
      error => console.log(error)
    );

    store.select(fromApp.getIsLoading).subscribe(loading => {
      this.isLoading = loading;
    });
  }

  ngOnInit() {}
}
