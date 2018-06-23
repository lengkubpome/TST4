import { Weighting } from './../weighting.model';
import { WeightLoadingService } from '../weight-loading.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { Product, Dummy_Product } from './../product.model';

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
    private weightLoadingService: WeightLoadingService) {
    this.products = Dummy_Product;
  }

  ngOnInit() {
    this.weightLoadingInForm = new FormGroup({
      car: new FormControl('', { validators: [Validators.required] }),
      customer: new FormControl(''),
      product: new FormControl('', { validators: [Validators.required] }),
      weightIn: new FormControl({ value: 2000, disabled: true })
    });

    this.filteredProducts = this.weightLoadingInForm.get('product').valueChanges.pipe(
      startWith(''),
      map(product => product ? this.filterProducts(product) : this.products.slice())
    );
  }

  filterProducts(val: any): Product[] {
    return this.products.filter(product =>
      product.name.indexOf(val) > -1 ||
      product.id.toString() === val);
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    const weighting: Weighting = {
      id: '1',
      dateLoadIn: new Date(Date.now()),
      dateLoadOut: null,
      car: this.weightLoadingInForm.get('car').value,
      customer: this.weightLoadingInForm.get('customer').value,
      product: this.weightLoadingInForm.get('product').value,
      price: 0,
      weightIn: this.weightLoadingInForm.get('weightIn').value,
      weightOut: 0,
      cutWeight: 0,
      totalWeight: 0,
      amount: 0,
      state: 'waiting',
      recorder: 'Tester' //TODO: แก้ไขผู้บันทึก
    };

    this.weightLoadingService.recordWeightLoading(weighting);
    this.dialogRef.close();
  }


}
