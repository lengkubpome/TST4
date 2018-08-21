import { Product, Dummy_Product } from './../../shared/models/product.model';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import * as prodcutAction from './store/product.action';
import * as fromApp from '../../app.reducer';

@Injectable()
export class ProductService {
  private products: Product[];
  constructor(private store: Store<fromApp.State>) {}

  fetchListProduct() {
    this.store.dispatch(new prodcutAction.SetListProduct(Dummy_Product));
    //TODO: get Log Product
  }

  createProduct(initProduct: { name: string; price: number }) {
    const newProduct = { status: 'active', ...initProduct };
    console.log(newProduct);
  }
}

