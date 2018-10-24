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

  addProduct(initProduct: { name: string; price: number }) {
    const recorder = 'Recorder';
    const newProduct: Product = { id: 'random', active: true, ...initProduct };

    this.store.dispatch(new prodcutAction.AddProduct(newProduct, recorder));
  }

  editProduct(productForm: Product, productChanged: Product) {
    const recorder = 'Recorder';
    this.store.dispatch(new prodcutAction.EditProduct(productForm, productChanged, recorder));
  }

  deleteProduct(product: Product) {
    const recorder = 'Recorder';
    this.store.dispatch(new prodcutAction.DeleteProduct(product, recorder));
  }
}
