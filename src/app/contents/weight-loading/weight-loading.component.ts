import { Component, OnInit } from '@angular/core';
import * as fromWeightLoading from './store/weight-loading.reducer';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';

@Component({
  selector: 'tst-weight-loading',
  templateUrl: './weight-loading.component.html',
  styleUrls: ['./weight-loading.component.scss']
})
export class WeightLoadingComponent implements OnInit {

  showRoute = '';

  constructor(private store: Store<fromWeightLoading.State>) {
    store.select(fromWeightLoading.getRoute).subscribe(
      (res: string) =>
        res !== undefined ? this.showRoute = res : this.showRoute = '',
      error => console.log(error));
  }

  ngOnInit() {


  }

}
