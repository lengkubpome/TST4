import { Product, Dummy_Product } from './../../../shared/models/product.model';
import * as _action from './product.action';

export interface State {
  // isAuthenticated: boolean;
  listProduct: Product[];
}

const initialState: State = {
  // listProduct: []
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
      return {
        listProduct: [...state.listProduct, action.payload]
      };
    // case _action.EDIT_PRODUCT:
    //   return {
    //     isAuthenticated: false
    //   };
    // case _action.DELETE_PRODUCT:
    //   return {
    //     isAuthenticated: false
    //   };
    default: {
      return state;
    }
  }
}

export const getProduct = (state: State) => state.listProduct;
