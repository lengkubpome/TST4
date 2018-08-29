import { MatDialogRef } from '@angular/material';
import { ProductService } from './../product.service';
import { Product } from '../../../shared/models/product.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { forbiddenProducts } from '../../../shared/custom-validator-fn/validator-products';
import { Store } from '@ngrx/store';

import * as fromApp from '../../../app.reducer';

@Component({
  selector: 'tst-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss']
})
export class CreateProductComponent implements OnInit {
  createProductForm: FormGroup;
  products: Product[] = [];

  constructor(
    private dialogRef: MatDialogRef<CreateProductComponent>,
    private fb: FormBuilder, private store: Store<fromApp.State>, private productService: ProductService) {
    this.store.select(fromApp.getListProduct).subscribe((products: Product[]) => {
      this.products = products;
    });
  }

  ngOnInit() {
    this.createProductForm = this.fb.group({
      name: ['', Validators.compose([Validators.required, forbiddenProducts(this.products)])],
      price: [{ value: 0, disabled: false }, Validators.required]
    });
  }

  onSubmit() {
    this.productService.addProduct(this.createProductForm.value);
    this.dialogRef.close();
  }
}
