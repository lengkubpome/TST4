import { WeightPrintService } from './../shared/weight-print.service';
import { CancelDialogComponent } from './alert-dialog.component';
import { Component, OnInit, Inject, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar } from '@angular/material';

import { Observable, Subscription, interval } from 'rxjs';
import { startWith, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { allowedProducts } from '../../../shared/custom-validator-fn/validator-products';

import { Weighting, WeightingNote } from '../../../shared/models/weighting.model';
import { Product } from '../../../shared/models/product.model';
import { CutWeightComponent } from './cut-weight/cut-weight.component';

import { WeightLoadingService } from '../shared/weight-loading.service';

import { Store, compose } from '@ngrx/store';
import * as fromApp from '../../../app.reducer';
import * as fromWeightLoading from '../store/weight-loading.reducer';
import { DeviceService } from '../shared/device.service';

@Component({
  selector: 'tst-weight-loading-out',
  templateUrl: './weight-loading-out.component.html',
  styleUrls: ['./weight-loading-out.component.scss']
})
export class WeightLoadingOutComponent implements OnInit, OnDestroy {
  weightLoading: Weighting;
  weightLoadingOutForm: FormGroup;
  formLoading = false;
  weightingMode: string;

  weightData: { stable: boolean; weight: number } = { stable: false, weight: 0 };

  dateLoadIn: any;
  timeNow: Date;
  price = 0;
  totalWeight = 0;

  notes: WeightingNote[] = [];

  showCutWeight: boolean;
  cutWeight: { value: number; unitType: string; note: string } = null;
  totalCutWeight = 0;

  products: Product[];
  filteredProducts: Observable<Product[]>;

  timeSubscription = new Subscription();
  modeSubscription = new Subscription();

  // Stock
  stockList: string[] = ['สินค้าทั่วไป', 'ไม่คิดภาษี', 'ไม่ร่วมรายการ'];

  constructor(
    private store: Store<fromWeightLoading.State>,
    public dialogRef: MatDialogRef<WeightLoadingOutComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private weightLoadingService: WeightLoadingService,
    private deviceService: DeviceService,
    public snackBar: MatSnackBar,
    private printService: WeightPrintService
  ) {
    this.store.select(fromApp.getListProduct).subscribe((products: Product[]) => {
      this.products = products;
    });
  }

  ngOnInit() {
    this.weightLoading = this.data.weighting;
    // fix error where production
    this.dateLoadIn = this.weightLoading.dateLoadIn;

    this.weightLoadingOutForm = this.fb.group({
      car: [{ value: this.weightLoading.car, disabled: false }, Validators.required],
      vendor: [{ value: this.weightLoading.vendor, disabled: false }],
      customer: [{ value: this.weightLoading.customer, disabled: false }],
      product: [
        { value: this.weightLoading.product, disabled: false },
        Validators.compose([Validators.required, allowedProducts(this.products)])
      ],
      price: [{ value: this.weightLoading.price, disabled: false }, Validators.compose([Validators.required])],
      type: [{ value: this.weightLoading.type, disabled: false }],
      weightIn: [{ value: this.weightLoading.weightIn, disabled: true }],
      weightOut: [{ value: 0, disabled: true }],
      weightOutManual: [{ value: 0, disabled: false }],
      cutWeight: [{ value: 0, disabled: true }],
      totalWeight: [{ value: 0, disabled: true }],
      amount: [{ value: 0, disabled: true }],
      stocks: []
    });

    // จัดการน้ำหนักจากอุปกรณ์
    this.modeSubscription = this.store.select(fromWeightLoading.getMode).subscribe(mode => {
      this.weightingMode = mode;
      if (mode === 'auto') {
        this.deviceService.reserveData();
        this.store.select(fromWeightLoading.getDeviceData).subscribe(d => {
          if (d.data !== null) {
            this.weightData.stable = d.data.stable;
            this.weightData.weight = parseFloat(d.data.integer + '.' + d.data.decimal);
            this.weightLoadingOutForm.get('weightOut').setValue(this.weightData.weight);
            this.calculateWeightLoading();
          }
        });

        this.weightLoadingOutForm.get('weightOutManual').clearValidators();
      } else if (mode === 'manual') {
        this.weightData = { stable: true, weight: null };

        const weightMax = this.weightLoadingOutForm.get('weightIn').value;
        this.weightLoadingOutForm
          .get('weightOutManual')
          .setValidators(Validators.compose([Validators.required, Validators.max(weightMax), Validators.min(1)]));
      }
    });

    // Weight Data Manual Change
    this.weightLoadingOutForm.get('weightOutManual').valueChanges.subscribe(value => {
      this.weightData.weight = value;
      this.calculateWeightLoading();
    });

    // initial Notes
    this.weightLoading.notes !== undefined ? (this.notes = this.weightLoading.notes) : (this.notes = []);
    this.calculateWeightLoading();

    // Fillter Products
    this.filteredProducts = this.weightLoadingOutForm.get('product').valueChanges.pipe(
      startWith(''),
      map(product => (product ? this.filterProducts(product) : this.products.slice()))
    );

    // Type Change
    this.weightLoadingOutForm.get('type').valueChanges.subscribe(v => {
      if (v === 'sell') {
        this.showCutWeight = false;
        this.onResetCutWeight();
        this.weightLoadingOutForm.get('vendor').setValue(this.weightLoading.vendor);
        this.weightLoadingOutForm.get('price').disable();
      } else if (v === 'buy' && !this.formLoading) {
        this.showCutWeight = this.showCutWeight;
        this.weightLoadingOutForm.get('customer').setValue(this.weightLoading.customer);
        this.weightLoadingOutForm.get('price').enable();
      } else if (v === 'buy' && this.formLoading) {
        this.weightLoadingOutForm.get('price').disable();
      }

      this.changePrice();
    });

    // Product Change
    this.weightLoadingOutForm
      .get('product')
      .valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.changePrice();
      });

    // Price Change
    this.weightLoadingOutForm
      .get('price')
      .valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => this.calculateWeightLoading());

    // counting time
    this.timeSubscription = interval(1000).subscribe(() => {
      this.timeNow = new Date(Date.now());
    });
  }

  ngOnDestroy(): void {
    this.modeSubscription.unsubscribe();
    if (this.weightingMode === 'auto') {
      this.deviceService.cancelReserveData();
    }
    this.timeSubscription.unsubscribe();
  }

  private changePrice() {
    const _type = this.weightLoadingOutForm.get('type').value;

    if (_type === 'buy') {
      const select = this.weightLoadingOutForm.get('product').value;
      const product = this.products.find(item => item.name === select);
      return product !== undefined
        ? this.weightLoadingOutForm.get('price').setValue(product.price)
        : this.weightLoadingOutForm.get('price').setValue(0);
    } else {
      this.weightLoadingOutForm.get('price').setValue(0);
    }
  }

  private calculateCutWeight() {
    const value = this.cutWeight.value;
    const unit = this.cutWeight.unitType;
    const note = this.cutWeight.note;

    if (unit === '%') {
      const cutWeightValue = Math.abs(this.weightLoading.weightIn - this.weightLoading.weightOut);

      this.totalCutWeight = cutWeightValue * (value / 100);
    } else if (unit === 'kg') {
      this.totalCutWeight = value;
    }

    this.totalCutWeight = Math.round(this.totalCutWeight); // ปัดทศนิยม
    this.weightLoadingOutForm.get('cutWeight').setValue(-this.totalCutWeight);

    if (this.totalCutWeight !== 0) {
      const noteCutWeight =
        'หักสิ่งเจือปน ' + Math.abs(this.totalCutWeight) + ' หน่วย (' + value + ' ' + unit + ') เนื่องจาก' + note;

      this.notes = this.notes.filter(res => res.type !== 'cutWeight');
      this.notes.push({ type: 'cutWeight', value: noteCutWeight });
    }
    this.calculateWeightLoading();
  }

  private calculateWeightLoading() {
    this.weightLoading.weightOut = this.weightData.weight;
    this.weightLoading.totalWeight =
      Math.abs(this.weightLoading.weightIn - this.weightLoading.weightOut) - this.totalCutWeight;

    this.weightLoadingOutForm.get('totalWeight').setValue(this.weightLoading.totalWeight);
    this.calculateAmount();
  }

  private calculateAmount() {
    this.price = this.weightLoadingOutForm.get('price').value;
    this.weightLoading.amount = Math.floor(this.weightLoading.totalWeight * this.price);

    this.weightLoadingOutForm.get('amount').setValue(this.weightLoading.amount);
  }

  onResetCutWeight() {
    this.totalCutWeight = 0;
    this.showCutWeight = false;

    this.cutWeight = null;
    this.notes = this.notes.filter(note => note.type !== 'cutWeight');

    this.calculateWeightLoading();
  }

  onShowCutWeight(): void {
    if (!this.formLoading) {
      const dialogRef = this.dialog.open(CutWeightComponent, {
        disableClose: false,
        // width: '400px',
        // height: '450px',
        data: {
          cutWeight: this.cutWeight
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result !== undefined) {
          if (result === 'delete') {
            console.log(`%c Here`, 'color:red');

            this.onResetCutWeight();
          } else {
            this.cutWeight = result;
            this.showCutWeight = true;
            this.calculateCutWeight();
          }
        }
      });
    }
  }

  onCancel() {
    const dialogRef = this.dialog.open(CancelDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.formLoading = true;
        this.disableForm();

        this.weightLoadingService
          .cancelWeightLoadingIn(this.weightLoading)
          .then(() => {
            this.snackBar.open('ข้อมูลถูกลบ', null, { duration: 2000 });
            this.dialogRef.close();
          })
          .catch(error => {
            console.log(error);
            this.snackBar.open('เกิดข้อผิดพลาดในการลบข้อมูล', 'ปิด');
            this.dialogRef.close();
          });
      }
    });
  }

  onSubmit() {
    if (this.weightLoadingOutForm.valid) {
      const weighting: Weighting = {
        bill_number: this.weightLoading.bill_number,
        dateLoadIn: this.weightLoading.dateLoadIn,
        dateLoadOut: new Date(Date.now()),
        car: this.weightLoadingOutForm.get('car').value,
        vendor: this.weightLoadingOutForm.get('vendor').value,
        customer: this.weightLoadingOutForm.get('customer').value,
        product: this.weightLoadingOutForm.get('product').value,
        price: this.weightLoadingOutForm.get('price').value,
        weightIn: this.weightLoading.weightIn,
        weightOut: this.weightData.weight,
        cutWeight: this.cutWeight,
        totalWeight: this.weightLoading.totalWeight,
        amount: this.weightLoading.amount,
        type: this.weightLoadingOutForm.get('type').value,
        notes: this.notes,
        recorder: { ...this.weightLoading.recorder, weightOut: 'RecorderX' }
      };

      this.disableForm();

      this.weightLoadingService
        .saveWeightLoadingOut(weighting)
        .then(() => {
          this.printService.printBillWeight(weighting);
          this.snackBar.open('เพิ่มข้อมูลสำเร็จ', null, { duration: 2000 });
          this.dialogRef.close();
        })
        .catch(error => {
          console.log(error);

          this.snackBar.open('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'ปิด');
          this.dialogRef.close();
        });
    }
  }

  private disableForm() {
    this.formLoading = true;

    Object.keys(this.weightLoadingOutForm.controls).forEach(key => {
      this.weightLoadingOutForm.get(key).disable();
    });
  }

  private filterProducts(val: any): Product[] {
    return this.products.filter(product => product.name.indexOf(val) > -1 || product.id.toString() === val);
  }

  onAddCustomer() {
    console.log('xxxxx');
  }
}
