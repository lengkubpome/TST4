import { MatTableDataSource, MatSort } from '@angular/material';
import { Weighting } from '../../../shared/models/weighting.model';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromWeightLoading from '../store/weight-loading.reducer';
import * as weightLoadingAction from '../store/weight-loading.actions';
import { WeightLoadingService } from '../shared/weight-loading.service';

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
    this.store.select(fromWeightLoading.getListWeightDeleted).subscribe((weighting: Weighting[]) => {
      this.dataSource.data = weighting;

    });
    // this.weightLoadingService.fetchListWeightDeleted();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
}
