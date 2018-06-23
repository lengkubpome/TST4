import { Weighting } from '../weighting.model';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatSort, MatDialog } from '@angular/material';

import { WeightLoadingInComponent } from './../weight-loading-in/weight-loading-in.component';
import { WeightLoadingService } from '../weight-loading.service';

import * as fromWeightLoading from '../weight-loading.reducer';
import { Store } from '@ngrx/store';
import { WeightLoadingOutComponent } from '../weight-loading-out/weight-loading-out.component';

@Component({
  selector: 'tst-list-weight-loading',
  templateUrl: './list-weight-loading.component.html',
  styleUrls: ['./list-weight-loading.component.scss']
})
export class ListWeightLoadingComponent implements OnInit, AfterViewInit {

  displayedColumns = ['car', 'product', 'weightIn', 'dateLoadIn', 'recorder'];
  dataSource = new MatTableDataSource<Weighting>();

  @ViewChild(MatSort) sort: MatSort;

  constructor(private dialog: MatDialog,
    private store: Store<fromWeightLoading.State>,
    private weightLoadingService: WeightLoadingService) { }

  ngOnInit() {
    this.store.select(fromWeightLoading.getListWeightLoading)
      .subscribe((weighting: Weighting[]) => {
        this.dataSource.data = weighting;
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
      data: { weighting : weighting }
    });
  }


}
