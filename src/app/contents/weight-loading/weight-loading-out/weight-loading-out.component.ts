import { Product, Dummy_Product } from './../product.model';
import { FormGroup, Validators, FormControl, FormBuilder } from '@angular/forms';
import { Weighting } from './../weighting.model';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs';
import { WeightLoadingService } from '../weight-loading.service';
import { startWith, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'tst-weight-loading-out',
  templateUrl: './weight-loading-out.component.html',
  styleUrls: ['./weight-loading-out.component.scss']
})
export class WeightLoadingOutComponent implements OnInit {

  showCutWeight: false;

  price = 0;
  totalWeight = 0;
  cutWeight = 0;

  showComment: false;

  weightLoading: Weighting;

  weightLoadingOutForm: FormGroup;
  products: Product[];
  filteredProducts: Observable<Product[]>;

  constructor(public dialogRef: MatDialogRef<WeightLoadingOutComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private weightLoadingService: WeightLoadingService
  ) {
    this.products = Dummy_Product;
  }

  ngOnInit() {
    this.weightLoading = this.data.weighting;

    this.weightLoadingOutForm = this.fb.group({
      car: [{ value: this.weightLoading.car, disabled: true }, Validators.required],
      customer: [{ value: this.weightLoading.customer, disabled: true }],
      product: [{ value: this.weightLoading.product, disabled: false }, Validators.required],
      price: [{ value: this.weightLoading.price, disabled: false },
      Validators.compose([Validators.required,])],
      weightIn: [{ value: this.weightLoading.weightIn, disabled: true }],
      weightOut: [{ value: 1000, disabled: true }],
      cutWeight: [{ value: 0, disabled: true }],
      totalWeight: [{ value: 0, disabled: true }],
      amount: [{ value: 0, disabled: true }],
      cutWeightInput: ['0'],
      cutWeightTypeUnit: ['kg'],
      cutWeightNote: ['']

    });

    this.calculateWeightLoading();

    this.filteredProducts = this.weightLoadingOutForm.get('product').valueChanges.pipe(
      startWith(''),
      map(product => product ? this.filterProducts(product) : this.products.slice())
    );

    // Price Change
    this.weightLoadingOutForm.get('price').valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => this.calculateWeightLoading());

    // Weight Loading Out Change
    this.weightLoadingOutForm.get('weightOut').valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => this.calculateWeightLoading());

    // Cut Weight Input Change
    this.weightLoadingOutForm.get('cutWeightInput').valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => this.calculateCutWeight());
    // Cut Weight Note Change
    this.weightLoadingOutForm.get('cutWeightNote').valueChanges
      .pipe(
        debounceTime(800),
        distinctUntilChanged()
      )
      .subscribe(() => this.calculateCutWeight());
    // Cut Weight Type Change
    this.weightLoadingOutForm.get('cutWeightTypeUnit').valueChanges
      .pipe(
        distinctUntilChanged()
      )
      .subscribe(() => this.calculateCutWeight());
  }

  private calculateCutWeight() {
    const value = this.weightLoadingOutForm.get('cutWeightInput').value;
    const unit = this.weightLoadingOutForm.get('cutWeightTypeUnit').value;
    const note = this.weightLoadingOutForm.get('cutWeightNote').value;
    if (unit === '%') {
      const totalWeight = Math.abs(this.weightLoadingOutForm.get('weightIn').value - this.weightLoadingOutForm.get('weightOut').value);

      this.cutWeight = - totalWeight * (value / 100);

    } else if (unit === 'kg') {
      this.cutWeight = -value;
    }

    this.cutWeight = Math.round(this.cutWeight); // ปัดทศนิยม
    this.weightLoadingOutForm.get('cutWeight').setValue(this.cutWeight);

    if (this.cutWeight !== 0) {
      console.log('หักน้ำหนัก ' + Math.abs(this.cutWeight) + 'กก. (' + value + ' ' + unit + ') เนื่องจาก' + note );

    }

    this.calculateWeightLoading();

  }

  private calculateWeightLoading() {
    const weightIn = this.weightLoadingOutForm.get('weightIn').value;
    const weightOut = this.weightLoadingOutForm.get('weightOut').value;
    this.totalWeight = Math.abs(weightIn - weightOut) + this.cutWeight;

    this.weightLoadingOutForm.get('totalWeight').setValue(this.totalWeight);
    this.calculateAmount();
  }

  private calculateAmount() {
    this.totalWeight = this.weightLoadingOutForm.get('totalWeight').value;
    this.price = this.weightLoadingOutForm.get('price').value;
    const amount = Math.floor(this.totalWeight * this.price);

    this.weightLoadingOutForm.get('amount').setValue(amount);

  }

  onCancelCutWeight() {
    this.cutWeight = 0;
    this.showCutWeight = false;
    this.weightLoadingOutForm.get('cutWeightInput').setValue(0);

  }

  filterProducts(val: any): Product[] {
    return this.products.filter(product =>
      product.name.indexOf(val) > -1 ||
      product.id.toString() === val);
  }


  onSubmit() {
    console.log('Submit');

  }

}
