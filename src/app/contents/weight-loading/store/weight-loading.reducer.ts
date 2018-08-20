import {
  WeightLoadingActions,
  SET_WEIGHT_LOADING_ID,
  SET_LIST_WEIGHT_LOADING,
  ADD_WEIGHT_LOADING_IN,
  ADD_WEIGHT_LOADING_OUT,
  SET_ROUTE
} from './weight-loading.actions';
import { Weighting } from '../../../shared/models/weighting.model';

import * as fromRoot from '../../../app.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export interface WeightLoadingState {
  routeName: string;
  listWeightLoading: Weighting[];
  weightLoadingId: string;
  getWeightFromDevice: number;
}

export interface State extends fromRoot.State {
  weightLoading: WeightLoadingState;
}

const initialState: WeightLoadingState = {
  routeName: '',
  listWeightLoading: [],
  weightLoadingId: '',
  getWeightFromDevice: 0
};

export function weightLoadingReducer(state = initialState, action: WeightLoadingActions) {
  switch (action.type) {
    case SET_ROUTE:
      return {
        ...state,
        routeName: action.payload
      };

    case SET_LIST_WEIGHT_LOADING:
      return {
        ...state,
        listWeightLoading: action.payload
      };

    case SET_WEIGHT_LOADING_ID:
      return {
        ...state,
        weightLoadingId: action.payload
      };

    case ADD_WEIGHT_LOADING_IN:
      const lastID = state.weightLoadingId + 1;
      const chkLength = lastID.toString().length;
      const currentID = 'WL' + new Date().getFullYear() + '/' + '0'.repeat(5 - chkLength) + lastID;
      action.payload.id = currentID;

      return {
        listWeightLoading: [...state.listWeightLoading, action.payload]
      };

    case ADD_WEIGHT_LOADING_OUT:
      const id = action.payload.id;
      const index = state.listWeightLoading.findIndex(item => item.id === id);
      const listWeightLoading = [...state.listWeightLoading];
      listWeightLoading[index] = action.payload;
      return {
        listWeightLoading: listWeightLoading
      };

    default: {
      return state;
    }
  }
}

export const getWeightLoadingState = createFeatureSelector<WeightLoadingState>('weightLoading');

export const getRoute = createSelector(getWeightLoadingState, (state: WeightLoadingState) => state.routeName);
export const getListWeightLoading = createSelector(
  getWeightLoadingState,
  (state: WeightLoadingState) => state.listWeightLoading
);
export const getWeightLoadingId = createSelector(
  getWeightLoadingState,
  (state: WeightLoadingState) => state.weightLoadingId
);
