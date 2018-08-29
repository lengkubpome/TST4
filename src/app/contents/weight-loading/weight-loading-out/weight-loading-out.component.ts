import { WeightPrintService } from './../shared/weight-print.service';
import { CancelDialogComponent } from './alert-dialog.component';
import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';

import { Observable } from 'rxjs';
import { startWith, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { allowedProducts } from '../../../shared/custom-validator-fn/validator-products';

import { Weighting, WeightingNote } from '../../../shared/models/weighting.model';
import { Product, Dummy_Product } from '../../../shared/models/product.model';
import { CutWeightComponent } from './cut-weight/cut-weight.component';

import { WeightLoadingService } from '../weight-loading.service';

import { Store } from '@ngrx/store';
import * as fromApp from '../../../app.reducer';

@Component({
  selector: 'tst-weight-loading-out',
  templateUrl: './weight-loading-out.component.html',
  styleUrls: ['./weight-loading-out.component.scss']
})
export class WeightLoadingOutComponent implements OnInit {
  weightLoading: Weighting;
  weightLoadingOutForm: FormGroup;
  loadingMode = false;

  price = 0;
  totalWeight = 0;

  notes: WeightingNote[] = [];

  showCutWeight: boolean;
  cutWeight: { value: number; unitType: string; note: string } = null;
  totalCutWeight = 0;

  products: Product[];
  filteredProducts: Observable<Product[]>;

  @ViewChild('btnMenu') btnMenu: HTMLButtonElement;
  // @ViewChild('btnNotes') btnNotes: HTMLButtonElement;
  @ViewChild('btnCutWeight') btnCutWeight: HTMLButtonElement;
  @ViewChild('btnCancel') btnCancel: HTMLButtonElement;

  constructor(
    private store: Store<fromApp.State>,
    public dialogRef: MatDialogRef<WeightLoadingOutComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private weightLoadingService: WeightLoadingService,
    private printService: WeightPrintService
  ) {
    this.store.select(fromApp.getListProduct).subscribe((products: Product[]) => {
      this.products = products;
    });
  }

  ngOnInit() {
    this.weightLoading = this.data.weighting;

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
      cutWeight: [{ value: 0, disabled: true }],
      totalWeight: [{ value: 0, disabled: true }],
      amount: [{ value: 0, disabled: true }]
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
    this.weightLoadingOutForm.get('type').valueChanges.subscribe(value => {
      if (value === 'sell') {
        this.showCutWeight = false;
        this.onResetCutWeight();
        this.weightLoadingOutForm.get('vendor').setValue(this.weightLoading.vendor);
        this.weightLoadingOutForm.get('price').disable();
      } else {
        this.showCutWeight = this.showCutWeight;
        this.weightLoadingOutForm.get('customer').setValue(this.weightLoading.customer);
        this.weightLoadingOutForm.get('price').enable();
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

    // Weight Loading Out Change
    this.weightLoadingOutForm
      .get('weightOut')
      .valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => this.calculateWeightLoading());



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

  private getWeightFromDevice(): number {
    const value = 9999; //FIXME: แก้ค่าที่ไม่ผ่าน UI
    this.weightLoadingOutForm.get('weightOut').setValue(value);
    return value;
  }

  private calculateWeightLoading() {
    this.weightLoading.weightOut = this.getWeightFromDevice();
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
    const dialogRef = this.dialog.open(CutWeightComponent, {
      disableClose: false,
      data: {
        cutWeight: this.cutWeight
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result === 'delete') {
          this.onResetCutWeight();
        } else {
          this.cutWeight = result;
          this.showCutWeight = true;
          this.calculateCutWeight();
        }
      }
    });
  }

  onCancel() {
    const dialogRef = this.dialog.open(CancelDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.weightLoadingService.cancelWeightLoading(this.weightLoading);
        this.dialogRef.close();
      }
    });
  }

  onSubmit() {
    const weighting: Weighting = {
      id: this.weightLoading.id,
      dateLoadIn: this.weightLoading.dateLoadIn,
      dateLoadOut: new Date(Date.now()),
      car: this.weightLoadingOutForm.get('car').value,
      vendor: this.weightLoadingOutForm.get('vendor').value,
      customer: this.weightLoadingOutForm.get('customer').value,
      product: this.weightLoadingOutForm.get('product').value,
      price: this.weightLoadingOutForm.get('price').value,
      weightIn: this.weightLoading.weightIn,
      weightOut: this.weightLoading.weightOut,
      cutWeight: this.cutWeight,
      totalWeight: this.weightLoading.totalWeight,
      amount: this.weightLoading.amount,
      type: this.weightLoadingOutForm.get('type').value,
      state: 'completed',
      notes: this.notes
    };

    console.log(weighting);


    // TODO: สร้างระบบให้เช็คว่าบันทึกข้อมูลผ่านหรือไม่
    // this.weightLoadingService.recordWeightLoadingOut(weighting);
    // this.printService.printBillWeight(weighting);
    // this.dialogRef.close();
  }

  saveData() {
    // this.btnMenu.disabled = true;
    // this.btnCutWeight.disabled = true;
    // this.btnCancel.disabled = true;
    // this.weightLoadingOutForm.disable();
    // this.loadingMode = true;
  }

  filterProducts(val: any): Product[] {
    return this.products.filter(product => product.name.indexOf(val) > -1 || product.id.toString() === val);
  }
}
