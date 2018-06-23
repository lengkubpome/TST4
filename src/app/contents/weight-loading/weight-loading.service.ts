import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { Weighting } from './weighting.model';

import * as fromWeightLoading from './weight-loading.reducer';
import * as WeightLoading from './weight-loading.action';
import { Store } from '@ngrx/store';

@Injectable()
export class WeightLoadingService {

  private weightList: Weighting[] = Dummy_Weight;

  constructor(private store: Store<fromWeightLoading.State>) { }

  fetchListWeightLoading() {
    this.store.dispatch(new WeightLoading.SetListWeightLoading(this.weightList));
  }

  recordWeightLoading(weighting: Weighting) {
    this.addWeightingToDatabase(weighting);
    this.fetchListWeightLoading();
  }

  private addWeightingToDatabase(weighting: Weighting) {
    this.weightList = [...this.weightList, weighting];
  }

}


const Dummy_Weight: Weighting[] = [
  {
    id: '1',
    dateLoadIn: new Date(Date.now()),
    dateLoadOut: new Date(Date.now()),
    car: '80-2155',
    customer: '',
    product: 'เศษเหล็ก',
    price: 10.10,
    weightIn: 13945,
    weightOut: 9060,
    cutWeight: 0,
    totalWeight: 4885,
    amount: 49339,
    state: 'completed',
    recorder: 'Tester',
  },
  {
    id: '2',
    dateLoadIn: new Date(Date.now()),
    dateLoadOut: new Date(Date.now()),
    car: '1415',
    customer: '',
    product: 'กล่อง',
    price: 10.10,
    weightIn: 2705,
    weightOut: 1565,
    cutWeight: 0,
    totalWeight: 1140,
    amount: 5130,
    state: 'completed',
    recorder: 'Tester',
  },
  {
    id: '3',
    dateLoadIn: new Date(Date.now()),
    dateLoadOut: new Date(Date.now()),
    car: '9974',
    customer: '',
    product: 'เศษเหล็กหนา',
    price: 10.00,
    weightIn: 1955,
    weightOut: 1840,
    cutWeight: 0,
    totalWeight: 115,
    amount: 1150,
    state: 'completed',
    recorder: 'Tester',
  }
];
