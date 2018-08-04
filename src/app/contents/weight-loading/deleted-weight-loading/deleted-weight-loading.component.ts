import { MatTableDataSource, MatSort } from '@angular/material';
import { Weighting } from '../weighting.model';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromWeightLoading from '../store/weight-loading.reducer';
import * as weightLoadingAction from '../store/weight-loading.actions';
import { WeightLoadingService } from '../weight-loading.service';

@Component({
  selector: 'tst-deleted-weight-loading',
  templateUrl: './deleted-weight-loading.component.html',
  styleUrls: ['./deleted-weight-loading.component.scss']
})
export class DeletedWeightLoadingComponent implements OnInit, AfterViewInit {
  recentlyDeleted: Weighting[] = [];

  displayedColumns = ['car', 'product', 'weightIn', 'type', 'dateLoadIn', 'state'];
  dataSource = new MatTableDataSource<Weighting>();

  @ViewChild(MatSort) sort: MatSort;

  constructor(private store: Store<fromWeightLoading.State>, private weightLoadingService: WeightLoadingService) {
    this.store.dispatch(new weightLoadingAction.SetRoute('deleted'));
  }

  ngOnInit() {
    this.store.select(fromWeightLoading.getListWeightLoading).subscribe((weighting: Weighting[]) => {
      this.recentlyDeleted = weighting.filter(item => item.state === 'cancelled');
      this.dataSource.data = this.recentlyDeleted;
    });
    this.weightLoadingService.fetchListWeightLoading();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
}
