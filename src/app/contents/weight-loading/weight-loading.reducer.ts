import { WeightLoadingActions, SET_LIST_WEIGHT_LOADING } from './weight-loading.action';
import { Weighting } from './weighting.model';

import * as fromRoot from '../../app.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export interface WeightLoadingState {
  listWeightLoading: Weighting[];
}

export interface State extends fromRoot.State {
  weightLoading: WeightLoadingState;
}

const initialState: WeightLoadingState = {
  listWeightLoading: []
};

export function weightLoadingReducer(state = initialState, action: WeightLoadingActions) {
  switch (action.type) {
    case SET_LIST_WEIGHT_LOADING:
      return {
        ...state,
        listWeightLoading: action.payload
      };
    default: {
      return state;
    }
  }
}

export const getWeightLoadingState = createFeatureSelector<WeightLoadingState>('weightLoading');

export const getListWeightLoading = createSelector(getWeightLoadingState, (state: WeightLoadingState) => state.listWeightLoading);
