import { Device } from './../shared/device.model';
import * as _action from './weight-loading.actions';
import { Weighting } from '../../../shared/models/weighting.model';

import * as fromRoot from '../../../app.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export interface WeightLoadingState {
  routeName: string;
  listWeightLoading: Weighting[];
  weightLoadingId: string;
  receiveDataFromDevice: number;
  weightLoadingMode: 'auto' | 'manual';

  deviceState: string

}

export interface State extends fromRoot.State {
  weightLoading: WeightLoadingState;
}

const initialState: WeightLoadingState = {
  routeName: '',
  listWeightLoading: [],
  weightLoadingId: '',
  receiveDataFromDevice: 0,
  weightLoadingMode: 'manual',

  deviceState: ''

};

export function weightLoadingReducer(state = initialState, action: _action.WeightLoadingActions) {
  switch (action.type) {
    case _action.SET_ROUTE:
      return {
        ...state,
        routeName: action.payload
      };

    case _action.SET_LIST_WEIGHT_LOADING:
      return {
        ...state,
        listWeightLoading: action.payload
      };

    case _action.SET_WEIGHT_LOADING_ID:
      return {
        ...state,
        weightLoadingId: action.payload
      };

    case _action.ADD_WEIGHT_LOADING_IN:
      const lastID = state.weightLoadingId + 1;
      const chkLength = lastID.toString().length;
      const currentID = 'WL' + new Date().getFullYear() + '/' + '0'.repeat(5 - chkLength) + lastID;
      action.payload.id = currentID;

      return {
        ...state,
        listWeightLoading: [...state.listWeightLoading, action.payload]
      };

    case _action.ADD_WEIGHT_LOADING_OUT:
      const id = action.payload.id;
      const index = state.listWeightLoading.findIndex(item => item.id === id);
      const listWeightLoading = [...state.listWeightLoading];
      listWeightLoading[index] = action.payload;
      return {
        ...state,
        listWeightLoading: listWeightLoading
      };

    case _action.SET_WEIGHT_LOADING_MODE:
      return {
        ...state,
        weightLoadingMode: action.payload
      }


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

export const getMode = createSelector(getWeightLoadingState, (state: WeightLoadingState) => state.weightLoadingMode);

