import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { Store } from '@ngrx/store';
import * as weightLoadingAction from '../store/weight-loading.actions';
import * as fromWeightLoading from '../store/weight-loading.reducer';
import { WeightLoadingService } from '../shared/weight-loading.service';
import { Weighting } from '../../../shared/models/weighting.model';

@Component({
  selector: 'tst-past-weight-loading',
  templateUrl: './past-weight-loading.component.html',
  styleUrls: ['./past-weight-loading.component.scss']
})
export class PastWeightLoadingComponent implements OnInit, AfterViewInit {
  showSearchField = false;
  viewSelected = 'ทั้งหมด';

  listWeightOut: Weighting[] = [];

  displayedColumns = ['dateLoadIn', 'car', 'product', 'weightIn', 'weightOut', 'type'];
  dataSource = new MatTableDataSource<Weighting>();

  @ViewChild(MatSort) sort: MatSort;

  constructor(private store: Store<fromWeightLoading.State>, private weightLoadingService: WeightLoadingService) {
    this.store.dispatch(new weightLoadingAction.SetRoute('history'));
  }

  ngOnInit() {
    this.store.select(fromWeightLoading.getListWeightOut).subscribe((weighting: Weighting[]) => {
      this.dataSource.data = weighting;
      this.listWeightOut = weighting;
    });
    // this.weightLoadingService.fetchListWeightOut();
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
        res = this.listWeightOut;
        break;

      case 'buy':
        this.viewSelected = 'ซื้อเข้า';
        res = this.listWeightOut.filter(item => item.type === select);
        break;

      case 'sell':
        this.viewSelected = 'ขายออก';
        res = this.listWeightOut.filter(item => item.type === select);
        break;
    }

    this.dataSource.data = res;
  }
}
