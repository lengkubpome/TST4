import { Subscription } from 'rxjs';
import { DeviceService } from './../shared/device.service';
import { Weighting } from '../../../shared/models/weighting.model';
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, Pipe } from '@angular/core';
import { MatTableDataSource, MatSort, MatDialog, MatSnackBar } from '@angular/material';
import { Store } from '@ngrx/store';

import { WeightLoadingInComponent } from '../weight-loading-in/weight-loading-in.component';
import { WeightLoadingOutComponent } from '../weight-loading-out/weight-loading-out.component';

import { WeightLoadingService } from '../shared/weight-loading.service';

import * as fromWeightLoading from '../store/weight-loading.reducer';
import * as weightLoadingAction from '../store/weight-loading.actions';
import * as fromApp from '../../../app.reducer';

@Component({
  selector: 'tst-list-weight-loading',
  templateUrl: './list-weight-loading.component.html',
  styleUrls: ['./list-weight-loading.component.scss']
})
export class ListWeightLoadingComponent implements OnInit, AfterViewInit, OnDestroy {
  waitingList: Weighting[] = [];

  displayedColumns = ['car', 'product', 'weightIn', 'type', 'dateLoadIn'];
  dataSource = new MatTableDataSource<Weighting>();

  isLoading: boolean;
  weightLoadingMode: string;

  deviceStateSubscription = new Subscription();
  deviceDataSubscription = new Subscription();
  deviceData: {
    state: string;
    data: any;
    user: string;
  };

  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private dialog: MatDialog,
    private store: Store<fromWeightLoading.State>,
    private weightLoadingService: WeightLoadingService,
    public snackBar: MatSnackBar
  ) {
    store.dispatch(new weightLoadingAction.SetRoute(null));
    // set ui loading
    store.select(fromApp.getIsLoading).subscribe(loading => {
      this.isLoading = loading;
    });

    store.select(fromWeightLoading.getMode).subscribe(mode => {
      this.weightLoadingMode = mode;
      this.dialog.closeAll();
      if (mode === 'auto') {
        this.deviceStateSubscription.unsubscribe();
        this.deviceStateSubscription = store.select(fromWeightLoading.getDeviceState).subscribe(s => {
          if (s.state !== 'serialport_open' && 'serialport_no_data') {
            this.dialog.closeAll();
          }
        });

        this.deviceDataSubscription.unsubscribe();
        this.deviceDataSubscription = this.store.select(fromWeightLoading.getDeviceData).subscribe(d => {
          this.deviceData = d;
          if (this.deviceData.state === 'active') {
            this.dialog.closeAll();
          }
        });
      }
    });
  }

  ngOnInit() {
    this.store.select(fromWeightLoading.getListWeightIn).subscribe((weighting: Weighting[]) => {
      this.dataSource.data = weighting;
      // console.log(weighting);
    });
    // this.weightLoadingService.fetchListWeightIn();
  }
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.deviceDataSubscription.unsubscribe();
  }

  onRecordWeightLoadingIn() {
    const dialogInRef = this.dialog.open(WeightLoadingInComponent, {
      width: '90%',
      maxWidth: '600px',
      autoFocus: true,
      disableClose: true
    });

    dialogInRef.afterClosed().subscribe(() => {
      if (this.weightLoadingMode === 'manual') {
        setTimeout(() => {
          this.snackBar.open('Manual Mode');
        }, 2000);
      }
    });
  }

  onRecordWeightLoadingOut(weighting: any) {
    const dialogInRef = this.dialog.open(WeightLoadingOutComponent, {
      width: '90%',
      maxWidth: '600px',
      autoFocus: true,
      disableClose: true,
      data: { weighting: weighting }
    });
    dialogInRef.afterClosed().subscribe(() => {
      if (this.weightLoadingMode === 'auto') {
        if (this.deviceData.state === 'active') {
          this.snackBar.open('ขณะนี้กำลังมีการใช้งานอยู่...', 'ปิด');
        }
      } else {
        setTimeout(() => {
          this.snackBar.open('Manual Mode');
        }, 2000);
      }
    });
  }
}
