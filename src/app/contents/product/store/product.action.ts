import { Product, ProductChangeLog } from '../../../shared/models/product.model';
import { Action } from '@ngrx/store';

export const SET_LIST_PRODUCT = '[PRODUCT] Set List Of Product';
export const SET_List_PRODUCT_Change_LOG = '[PRODUCT] Set change Log Of Product';
export const ADD_PRODUCT = '[PRODUCT] added';
export const EDIT_PRODUCT = '[PRODUCT] edited';
export const DELETE_PRODUCT = '[PRODUCT] deleted';

export class SetListProduct implements Action {
  readonly type = SET_LIST_PRODUCT;
  constructor(public payload: Product[]) {}
}

export class SetListProductChangeLog implements Action {
  readonly type = SET_List_PRODUCT_Change_LOG;
  constructor(public payload: ProductChangeLog[]) {}
}

export class AddProduct implements Action {
  readonly type = ADD_PRODUCT;
  constructor(public product: Product, public recoder: string) {}
}

export class EditProduct implements Action {
  readonly type = EDIT_PRODUCT;
  constructor(public productFrom: Product, public productChanged, public recoder: string) {}
}

export class DeleteProduct implements Action {
  readonly type = DELETE_PRODUCT;
  constructor(public product: Product, public recoder: string) {}
}

export type ProductAction = SetListProduct | SetListProductChangeLog | AddProduct | EditProduct | DeleteProduct;
