import { Dummy_Product } from './../../shared/models/product.model';
import { Injectable } from '@angular/core';
import { Weighting } from '../../shared/models/weighting.model';

import * as fromWeightLoading from './store/weight-loading.reducer';
import * as WeightLoading from './store/weight-loading.actions';
import * as productAct from '../product/store/product.action';

import { Store } from '@ngrx/store';

@Injectable()
export class WeightLoadingService {
  private weightList: Weighting[] = Dummy_Weight;
  private weightLoadingId: number = Dummy_doc_id.weightLoadingID;

  constructor(private store: Store<fromWeightLoading.State>) {
    // this.store.dispatch(new productAct.SetListProduct(Dummy_Product));
  }

  fetchListWeightLoading() {
    this.store.dispatch(new WeightLoading.SetListWeightLoading(this.weightList));
    this.store.dispatch(new WeightLoading.SetWeightLoadingID(this.weightLoadingId));
  }

  recordWeightLoadingIn(weighting: Weighting) {
    this.store.dispatch(new WeightLoading.AddWeightLoadingIn(weighting));

    this.addWeightingToDatabase(weighting);
    this.fetchListWeightLoading();
  }

  recordWeightLoadingOut(weighting: Weighting) {
    this.updateWeightToDatabase(weighting);
    this.fetchListWeightLoading();

    // this.store.dispatch(new WeightLoading.AddWeightLoadingOut(weighting));
  }

  cancelWeightLoading(weighting: Weighting) {
    weighting.state = 'cancelled';
    weighting.dateLoadOut = new Date(Date.now());
    this.updateWeightToDatabase(weighting);
    this.fetchListWeightLoading();
  }

  private addWeightingToDatabase(weighting: Weighting) {
    this.weightList = [...this.weightList, weighting];
    this.weightLoadingId++;
  }
  private updateWeightToDatabase(weighting: Weighting) {
    const id = weighting.id;
    const index = this.weightList.findIndex(item => item.id === id);
    const weightList = [...this.weightList];
    weightList[index] = weighting;
    this.weightList = weightList;
  }
}

const Dummy_doc_id = {
  weightLoadingID: 1
};

const Dummy_Weight: Weighting[] = [
  {
    id: '1',
    dateLoadIn: new Date(Date.now()),
    dateLoadOut: new Date(Date.now()),
    car: '80-2155',
    vendor: '',
    product: 'เศษเหล็ก',
    price: 10.1,
    weightIn: 13945,
    weightOut: 9060,
    totalWeight: 4885,
    amount: 49339,
    type: 'sell',
    state: 'completed',
    recorder: { weightIn: 'Recorder', weightOut: 'Recorder' }
  },
  {
    id: '2',
    dateLoadIn: new Date(Date.now()),
    dateLoadOut: new Date(Date.now()),
    car: '1415',
    vendor: '',
    product: 'กล่อง',
    price: 10.1,
    weightIn: 2705,
    weightOut: 1565,
    totalWeight: 1140,
    amount: 5130,
    type: 'buy',
    state: 'completed',
    recorder: { weightIn: 'Recorder', weightOut: 'Recorder' }
  },
  {
    id: '3',
    dateLoadIn: new Date(Date.now()),
    dateLoadOut: new Date(Date.now()),
    car: '9974',
    vendor: '',
    product: 'เศษเหล็กหนา',
    price: 10.0,
    weightIn: 1955,
    weightOut: 0,
    totalWeight: 0,
    amount: 0,
    type: 'buy',
    state: 'waiting',
    recorder: { weightIn: 'Recorder', weightOut: 'Recorder' }
  }
];
