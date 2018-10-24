import { MatSnackBar } from '@angular/material';
import { map } from 'rxjs/operators';
import { AngularFirestore } from 'angularfire2/firestore';

import { Injectable } from '@angular/core';
import { Weighting } from '../../../shared/models/weighting.model';

import * as uiAction from '../../../shared/store/ui.actions';

import * as fromWeightLoading from '../store/weight-loading.reducer';
import * as WeightLoading from '../store/weight-loading.actions';

import { Store } from '@ngrx/store';

const BUSINESS_ID = '0406069000354';

@Injectable()
export class WeightLoadingService {
  private weightList: Weighting[] = [];

  constructor(
    private store: Store<fromWeightLoading.State>,
    private afs: AngularFirestore,
    public snackBar: MatSnackBar
  ) {
    this.fetchListWeightIn();
    this.fetchListWeightOut();
    this.fetchListWeightDeleted();
  }

  fetchListWeightIn() {
    this.afs
      .collection('business')
      .doc(BUSINESS_ID)
      .collection('weight_in')
      .valueChanges()
      .subscribe((l: any) => {
        this.store.dispatch(new WeightLoading.SetListWeightIn(l));
      });
  }
  fetchListWeightOut() {
    this.afs
      .collection('business')
      .doc(BUSINESS_ID)
      .collection('weight_out')
      .valueChanges()
      .subscribe((l: any) => {
        this.store.dispatch(new WeightLoading.SetListWeightOut(l));
      });
  }
  fetchListWeightDeleted() {
    this.afs
      .collection('business')
      .doc(BUSINESS_ID)
      .collection('weight_deleted')
      .valueChanges()
      .subscribe((l: any) => {
        this.store.dispatch(new WeightLoading.SetListWeightDeleted(l));
      });
  }

  saveWeightLoadingIn(weighting: Weighting): Promise<void> {
    // this.store.dispatch(new uiAction.StartLoading());
    // this.snackBar.open('กำลังบันทึกข้อมูล...');

    const dbRef = this.afs.firestore.collection('business').doc(BUSINESS_ID);
    // transaction
    return this.afs.firestore.runTransaction(t => {
      return t.get(dbRef).then(doc => {
        // set bill number
        const bill: { format: string; number_latest: number } = doc.data().weight_loading_settings.bill;
        const nextNumber: number = bill.number_latest + 1;
        const numberLength: number = bill.format.match(/[#]/g).length;
        const runNumber = nextNumber.toString().padStart(numberLength, '0');
        const replace = bill.format.replace(/[#]/g, '');
        const nextBill = replace + runNumber;

        const setID = dbRef.collection('weight_in').doc(new Date(Date.now()).toString());
        t.set(setID, { ...weighting, bill_number: nextBill });
        t.update(dbRef, { 'weight_loading_settings.bill': { ...bill, number_latest: nextNumber } });
      });
    });
  }
  saveWeightLoadingOut(weighting: Weighting): Promise<void> {
    const dbRef = this.afs.firestore.collection('business').doc(BUSINESS_ID);
    const weightInRef = dbRef.collection('weight_in').where('bill_number', '==', weighting.bill_number);

    // transaction
    return this.afs.firestore.runTransaction(t => {
      return weightInRef.get().then(snap => {
        const id = snap.docs[0].id;
        const setID = dbRef.collection('weight_out').doc(id);
        const delWeightIn = dbRef.collection('weight_in').doc(id);
        t.set(setID, { ...weighting });
        t.delete(delWeightIn);
      });
    });
  }


  cancelWeightLoadingIn(weighting: Weighting): Promise<void> {
    const dbRef = this.afs.firestore.collection('business').doc(BUSINESS_ID);
    const weightInRef = dbRef.collection('weight_in').where('bill_number', '==', weighting.bill_number);

    // transaction
    return this.afs.firestore.runTransaction(t => {
      return weightInRef.get().then(snap => {
        const id = snap.docs[0].id;
        const setID = dbRef.collection('weight_deleted').doc(id);
        const delWeightIn = dbRef.collection('weight_in').doc(id);
        t.set(setID, { ...weighting });
        t.delete(delWeightIn);
      });
    });
  }
}
