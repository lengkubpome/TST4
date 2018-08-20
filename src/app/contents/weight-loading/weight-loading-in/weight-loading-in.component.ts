import { Weighting } from '../../../shared/models/weighting.model';
import { WeightLoadingService } from '../weight-loading.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Product, Dummy_Product } from '../../../shared/models/product.model';
import { forbiddenProducts } from '../shared/forbidden-products';

@Component({
  selector: 'tst-weight-loading-in',
  templateUrl: './weight-loading-in.component.html',
  styleUrls: ['./weight-loading-in.component.scss']
})
export class WeightLoadingInComponent implements OnInit {
  weightLoadingInForm: FormGroup;
  products: Product[];
  filteredProducts: Observable<Product[]>;

  constructor(
    public dialogRef: MatDialogRef<WeightLoadingInComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private weightLoadingService: WeightLoadingService
  ) {
    this.products = Dummy_Product;
  }

  ngOnInit() {
    this.weightLoadingInForm = this.fb.group({
      car: [{ value: '', disabled: false }, Validators.required],
      vendor: [{ value: '', disabled: false }],
      product: [
        { value: '', disabled: false },
        Validators.compose([Validators.required, forbiddenProducts(this.products)])
      ],
      price: [{ value: 0, disabled: false }, Validators.compose([Validators.required])],
      type: [{ value: 'buy', disabled: false }],
      weightIn: [{ value: 0, disabled: true }]
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
      if (value === 'sell') {
        this.weightLoadingInForm.get('price').disable();
      } else {
        this.weightLoadingInForm.get('price').enable();
      }
      this.changePrice();
    });

    // Fillter Products
    this.filteredProducts = this.weightLoadingInForm.get('product').valueChanges.pipe(
      startWith(''),
      map(product => (product ? this.filterProducts(product) : this.products.slice()))
    );
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
    const weighting: Weighting = {
      id: Date.now().toString(),
      dateLoadIn: new Date(Date.now()),
      dateLoadOut: null,
      car: this.weightLoadingInForm.get('car').value,
      vendor: this.weightLoadingInForm.get('vendor').value,
      product: this.weightLoadingInForm.get('product').value,
      price: this.weightLoadingInForm.get('price').value,
      weightIn: this.getWeightLoadingFromDevice(),
      weightOut: 0,
      totalWeight: 0,
      amount: 0,
      type: this.weightLoadingInForm.get('type').value,
      state: 'waiting'
    };

    // console.log(weighting);

    // TODO: สร้างระบบให้เช็คว่าบันทึกข้อมูลผ่านหรือไม่
    this.weightLoadingService.recordWeightLoadingIn(weighting);
    this.dialogRef.close();
  }

  private getWeightLoadingFromDevice(): number {
    const getValue = 20000;
    this.weightLoadingInForm.get('weightIn').setValue(getValue);
    return getValue;
  }
}
