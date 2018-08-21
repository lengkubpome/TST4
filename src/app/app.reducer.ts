import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromUi from './shared/store/ui.reducer';
import * as fromProduct from './contents/product/store/product.reducer';

export interface State {
  ui: fromUi.State;
  product: fromProduct.State;
}

export const reducers: ActionReducerMap<State> = {
  ui: fromUi.uiReducer,
  product: fromProduct.productReducer
};

const getUiState = createFeatureSelector<fromUi.State>('ui');
export const getIsLoading = createSelector(getUiState, fromUi.getIsLoading);

const getProductState = createFeatureSelector<fromProduct.State>('product');
export const getListProduct = createSelector(getProductState, (state: fromProduct.State) => state.listProduct);
