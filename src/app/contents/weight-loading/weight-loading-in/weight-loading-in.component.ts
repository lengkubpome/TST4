import { WeightData } from './../shared/device-parsing';
import { Weighting } from '../../../shared/models/weighting.model';
import { WeightLoadingService } from '../shared/weight-loading.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Product } from '../../../shared/models/product.model';
import { allowedProducts } from '../../../shared/custom-validator-fn/validator-products';
import { Store } from '@ngrx/store';

import * as fromApp from '../../../app.reducer';
import * as fromWeightLoading from '../store/weight-loading.reducer';
import { DeviceService } from '../shared/device.service';
@Component({
  selector: 'tst-weight-loading-in',
  templateUrl: './weight-loading-in.component.html',
  styleUrls: ['./weight-loading-in.component.scss']
})
export class WeightLoadingInComponent implements OnInit, OnDestroy {
  weightLoadingInForm: FormGroup;
  products: Product[];
  filteredProducts: Observable<Product[]>;
  formLoading = false;

  weightingMode: string;

  weightData: { stable: boolean; weight: number } = { stable: false, weight: 0 };

  modeSubscription = new Subscription();

  constructor(
    private store: Store<fromWeightLoading.State>,
    private dialogRef: MatDialogRef<WeightLoadingInComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private weightLoadingService: WeightLoadingService,
    private deviceService: DeviceService,
    public snackBar: MatSnackBar
  ) {
    this.store.select(fromApp.getListProduct).subscribe((products: Product[]) => {
      this.products = products;
    });
  }

  ngOnInit() {
    this.weightLoadingInForm = this.fb.group({
      car: [{ value: '', disabled: false }, Validators.required],
      vendor: [{ value: '', disabled: false }],
      customer: [{ value: '', disabled: false }],
      product: [
        { value: '', disabled: false },
        Validators.compose([Validators.required, allowedProducts(this.products)])
      ],
      price: [{ value: 0, disabled: false }, Validators.compose([Validators.required])],
      type: [{ value: 'buy', disabled: false }],
      weightIn: [{ value: 0, disabled: true }],
      weightInManual: [{ value: 0, disabled: false }]
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
            this.weightLoadingInForm.get('weightIn').setValue(this.weightData.weight);
          }
        });
      } else if (mode === 'manual') {
        this.weightData = { stable: true, weight: null };
        this.weightLoadingInForm
          .get('weightInManual')
          .setValidators(Validators.compose([Validators.required, Validators.min(1)]));
      }
    });

    // Product Change
    this.weightLoadingInForm
      .get('product')
      .valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.changePrice();
      });

    //Type Change
    this.weightLoadingInForm.get('type').valueChanges.subscribe(value => {
      if (value === 'sell' || this.formLoading) {
        this.weightLoadingInForm.get('vendor').setValue('');
        this.weightLoadingInForm.get('price').disable();
      } else {
        this.weightLoadingInForm.get('customer').setValue('');
        this.weightLoadingInForm.get('price').enable();
      }
    });

    // weightInManual Change
    this.weightLoadingInForm.get('weightInManual').valueChanges.subscribe(value => {
      this.weightData.weight = value;
    });

    // Fillter Products
    this.filteredProducts = this.weightLoadingInForm.get('product').valueChanges.pipe(
      startWith(''),
      map(product => (product ? this.filterProducts(product) : this.products.slice()))
    );
  }

  ngOnDestroy(): void {
    this.modeSubscription.unsubscribe();
    if (this.weightingMode === 'auto') {
      this.deviceService.cancelReserveData();
    }
  }

  filterProducts(val: any): Product[] {
    return this.products.filter(product => product.name.indexOf(val) > -1 || product.id.toString() === val);
  }

  private changePrice() {
    const _type = this.weightLoadingInForm.get('type').value;

    if (_type === 'buy') {
      const select = this.weightLoadingInForm.get('product').value;
      const product = this.products.find(item => item.name === select);
      return product !== undefined
        ? this.weightLoadingInForm.get('price').setValue(product.price)
        : this.weightLoadingInForm.get('price').setValue(0);
    } else {
      this.weightLoadingInForm.get('price').setValue(0);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    this.disableForm();

    const weighting: Weighting = {
      bill_number: '',
      dateLoadIn: new Date(Date.now()),
      car: this.weightLoadingInForm.get('car').value,
      vendor: this.weightLoadingInForm.get('vendor').value,
      customer: this.weightLoadingInForm.get('customer').value,
      product: this.weightLoadingInForm.get('product').value,
      price: this.weightLoadingInForm.get('price').value,
      weightIn: this.weightData.weight,
      weightOut: 0,
      totalWeight: 0,
      amount: 0,
      type: this.weightLoadingInForm.get('type').value,
      recorder: { weightIn: 'RecorderX', weightOut: '' }
    };

    this.weightLoadingService
      .saveWeightLoadingIn(weighting)
      .then(() => {
        this.snackBar.open('เพิ่มข้อมูลสำเร็จ', null, { duration: 2000 });
        this.dialogRef.close();
      })
      .catch(error => {
        console.log(error);

        this.snackBar.open('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'ปิด');
        this.dialogRef.close();
      });
  }

  private disableForm() {
    this.formLoading = true;

    Object.keys(this.weightLoadingInForm.controls).forEach(key => {
      this.weightLoadingInForm.get(key).disable();
    });
  }
}
