import { WeightData } from './../shared/device-parsing';
import { Device } from './../shared/device.model';
import * as _action from './weight-loading.actions';
import { Weighting } from '../../../shared/models/weighting.model';

import * as fromRoot from '../../../app.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export interface WeightLoadingState {
  routeName: string;
  listWeightLoading: Weighting[];
  listWeightIn: Weighting[],
  listWeightOut: Weighting[],
  listWeightDeleted: Weighting[],
  weightLoadingId: string;
  weightLoadingMode: string;

  deviceActive: Device;
  deviceState: { state: string; message: string };
  deviceData: { state: string; data: WeightData; user: string };
}

export interface State extends fromRoot.State {
  weightLoading: WeightLoadingState;
}

const initialState: WeightLoadingState = {
  routeName: '',
  listWeightLoading: [],
  listWeightIn: [],
  listWeightOut: [],
  listWeightDeleted: [],
  weightLoadingId: '',
  weightLoadingMode: '',

  deviceActive: null,
  deviceState: { state: '', message: '' },
  deviceData: { state: 'inactive', data: null, user: '' }
};

export function weightLoadingReducer(state = initialState, action: _action.WeightLoadingActions) {
  switch (action.type) {
    case _action.SET_ROUTE:
      return {
        ...state,
        routeName: action.payload
      };

    case _action.SET_LIST_WEIGHT_IN:
      return {
        ...state,
        listWeightIn: action.payload
      };

    case _action.SET_LIST_WEIGHT_OUT:
      return {
        ...state,
        listWeightOut: action.payload
      };

    case _action.SET_LIST_WEIGHT_DELETED:
      return {
        ...state,
        listWeightDeleted: action.payload
      };

    // case _action.SET_WEIGHT_LOADING_ID:
    //   return {
    //     ...state,
    //     weightLoadingId: action.payload
    //   };

    // case _action.ADD_WEIGHT_LOADING_IN:
      // const lastID = state.weightLoadingId + 1;
      // const chkLength = lastID.toString().length;
      // const currentID = 'WL' + new Date().getFullYear() + '/' + '0'.repeat(5 - chkLength) + lastID;
      // action.payload.id = currentID;

      // return {
      //   ...state,
      //   listWeightLoading: [...state.listWeightLoading, action.payload]
      // };

    // case _action.ADD_WEIGHT_LOADING_OUT:
    //   const id = action.payload.id;
    //   const index = state.listWeightLoading.findIndex(item => item.id === id);
    //   const listWeightLoading = [...state.listWeightLoading];
    //   listWeightLoading[index] = action.payload;
    //   return {
    //     ...state,
    //     listWeightLoading: listWeightLoading
    //   };

    case _action.SET_WEIGHT_LOADING_MODE:
      return {
        ...state,
        weightLoadingMode: action.payload
      };
    case _action.SET_DEVICE_ACTIVE:
      return {
        ...state,
        deviceActive: action.payload
      };
    case _action.SET_DEVICE_STATE:
      if (state.deviceState.state === action.payload.state) {
        return { ...state };
      } else {
        return {
          ...state,
          deviceState: action.payload
        };
      }
    case _action.SET_DEVICE_DATA:
      if (state.deviceData.data === action.payload.data &&
          state.deviceData.state === action.payload.state &&
          state.deviceData.user === action.payload.user
          ) {
        return { ...state };
      } else {
        return {
          ...state,
          deviceData: action.payload
        };
      }

    default: {
      return state;
    }
  }
}

export const getWeightLoadingState = createFeatureSelector<WeightLoadingState>('weightLoading');

export const getRoute = createSelector(getWeightLoadingState, (state: WeightLoadingState) => state.routeName);

export const getListWeightIn = createSelector(
  getWeightLoadingState,
  (state: WeightLoadingState) => state.listWeightIn
);
export const getListWeightOut = createSelector(
  getWeightLoadingState,
  (state: WeightLoadingState) => state.listWeightOut
);
export const getListWeightDeleted = createSelector(
  getWeightLoadingState,
  (state: WeightLoadingState) => state.listWeightDeleted
);

// export const getWeightLoadingId = createSelector(
//   getWeightLoadingState,
//   (state: WeightLoadingState) => state.weightLoadingId
// );

export const getMode = createSelector(getWeightLoadingState, (state: WeightLoadingState) => state.weightLoadingMode);
export const getDeviceActive = createSelector(getWeightLoadingState, (state: WeightLoadingState) => state.deviceActive);
export const getDeviceState = createSelector(getWeightLoadingState, (state: WeightLoadingState) => state.deviceState);
export const getDeviceData = createSelector(getWeightLoadingState, (state: WeightLoadingState) => state.deviceData);
