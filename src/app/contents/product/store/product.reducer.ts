import { Product, Dummy_Product, ProductChangeLog } from './../../../shared/models/product.model';
import * as _action from './product.action';

export interface State {
  // isAuthenticated: boolean;
  listProduct: Product[];
  productLog: ProductChangeLog[];
}

const initialState: State = {
  // listProduct: []
  productLog: [],
  listProduct: Dummy_Product
};

export function productReducer(state = initialState, action: _action.ProductAction) {
  switch (action.type) {
    case _action.SET_LIST_PRODUCT:
      return {
        ...state,
        listProduct: action.payload
      };
    case _action.ADD_PRODUCT:
      const eventAdd: ProductChangeLog = {
        id: new Date(Date.now()),
        recorder: action.recoder,
        product: action.product,
        from: null,
        changed: action.product,
        state: 'Added'
      };
      return {
        ...state,
        listProduct: [...state.listProduct, action.product],
        productLog: [eventAdd, ...state.productLog]
      };

    case _action.EDIT_PRODUCT:
      const id = action.productFrom.id;
      const index = state.listProduct.findIndex(item => item.id === id);
      const listProduct = [...state.listProduct];
      listProduct[index] = action.productChanged;
      const eventEdit: ProductChangeLog = {
        id: new Date(Date.now()),
        recorder: action.recoder,
        product: action.productFrom,
        from: action.productFrom,
        changed: action.productChanged,
        state: 'Edited'
      };

      return {
        ...state,
        listProduct: listProduct,
        productLog: [eventEdit, ...state.productLog]
      };

    case _action.DELETE_PRODUCT:
      const eventDelete: ProductChangeLog = {
        id: new Date(Date.now()),
        recorder: action.recoder,
        product: action.product,
        from: action.product,
        changed: null,
        state: 'Deleted'
      };

      return {
        ...state,
        listProduct: [...state.listProduct].filter(item => item.id !== action.product.id),
        productLog: [eventDelete, ...state.productLog]
      };
    default: {
      return state;
    }
  }
}

export const getProduct = (state: State) => state.listProduct;
export const getProductLog = (state: State) => state.productLog;
