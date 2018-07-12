import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { Store } from '@ngrx/store';
import * as weightLoadingAction from '../store/weight-loading.actions';
import * as fromWeightLoading from '../store/weight-loading.reducer';
import { WeightLoadingService } from '../weight-loading.service';
import { Weighting } from '../weighting.model';


@Component({
  selector: 'tst-past-weight-loading',
  templateUrl: './past-weight-loading.component.html',
  styleUrls: ['./past-weight-loading.component.scss']
})
export class PastWeightLoadingComponent implements OnInit, AfterViewInit {

  showSearchField = false;
  viewSelected = 'ทั้งหมด';

  finishedWeightLoadingList: Weighting[] = [];

  displayedColumns = ['dateLoadIn', 'car', 'product', 'weightIn', 'weightOut', 'type'];
  dataSource = new MatTableDataSource<Weighting>();

  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private store: Store<fromWeightLoading.State>,
    private weightLoadingService: WeightLoadingService) {
      this.store.dispatch(new weightLoadingAction.SetRoute('history'));
     }


  ngOnInit() {

    this.store.select(fromWeightLoading.getListWeightLoading)
      .subscribe((weighting: Weighting[]) => {
        this.finishedWeightLoadingList = weighting.filter(item => item.state === 'completed');
        this.dataSource.data = this.finishedWeightLoadingList;
      });
    this.weightLoadingService.fetchListWeightLoading();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  selectView(select: string) {
    let res: Weighting[] = [];
    switch (select) {
      case 'all':
        this.viewSelected = 'ทั้งหมด';
        res = this.finishedWeightLoadingList;
        break;

      case 'buy':
        this.viewSelected = 'ซื้อเข้า';
        res = this.finishedWeightLoadingList.filter(item =>
          item.type === select
        );
        break;

      case 'sell':
        this.viewSelected = 'ขายออก';
        res = this.finishedWeightLoadingList.filter(item =>
          item.type === select
        );
        break;
    }

    this.dataSource.data = res;
  }

}
