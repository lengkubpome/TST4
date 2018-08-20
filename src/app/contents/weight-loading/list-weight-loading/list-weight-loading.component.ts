import { Weighting } from '../../../shared/models/weighting.model';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatSort, MatDialog } from '@angular/material';
import { Store } from '@ngrx/store';

import { WeightLoadingInComponent } from '../weight-loading-in/weight-loading-in.component';
import { WeightLoadingOutComponent } from '../weight-loading-out/weight-loading-out.component';

import { WeightLoadingService } from '../weight-loading.service';

import * as fromWeightLoading from '../store/weight-loading.reducer';
import * as weightLoadingAction from '../store/weight-loading.actions';


@Component({
  selector: 'tst-list-weight-loading',
  templateUrl: './list-weight-loading.component.html',
  styleUrls: ['./list-weight-loading.component.scss']
})
export class ListWeightLoadingComponent implements OnInit, AfterViewInit {

  waitingList: Weighting[] = [];

  displayedColumns = ['car', 'product', 'weightIn', 'type', 'dateLoadIn'];
  dataSource = new MatTableDataSource<Weighting>();

  @ViewChild(MatSort) sort: MatSort;

  constructor(private dialog: MatDialog,
    private store: Store<fromWeightLoading.State>,
    private weightLoadingService: WeightLoadingService) {

      store.dispatch(new weightLoadingAction.SetRoute(''));

  }

  ngOnInit() {
    this.store.select(fromWeightLoading.getListWeightLoading)
      .subscribe((weighting: Weighting[]) => {
        this.waitingList = weighting.filter(item => item.state === 'waiting');
        this.dataSource.data = this.waitingList;

      });
    this.weightLoadingService.fetchListWeightLoading();

  }
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  onRecordWeightLoadingIn() {
    this.dialog.open(WeightLoadingInComponent, {
      width: '90%',
      maxWidth: '600px',
      autoFocus: true,
      disableClose: true
    });
  }

  onRecordWeightLoadingOut(weighting: any) {
    this.dialog.open(WeightLoadingOutComponent, {
      width: '90%',
      maxWidth: '600px',
      autoFocus: true,
      disableClose: true,
      data: { weighting: weighting }
    });
  }


}
