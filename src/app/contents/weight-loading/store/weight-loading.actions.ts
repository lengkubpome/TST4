import { WeightData } from './../shared/device-parsing';
import { Device } from './../shared/device.model';
import { Action } from '@ngrx/store';
import { Weighting } from '../../../shared/models/weighting.model';

export const SET_ROUTE = '[Route] Set Route';
export const SET_LIST_WEIGHT_IN = '[WeightLoading] Set List Weight In';
export const SET_LIST_WEIGHT_OUT = '[WeightLoading] Set List Weight Out';
export const SET_LIST_WEIGHT_DELETED = '[WeightLoading] Set List Weight Deleted';
export const SET_WEIGHT_LOADING_ID = '[WeightLoading] Set Weight Loading ID';
export const ADD_WEIGHT_LOADING_IN = '[WeightLoading] Add Weight Loading IN';
export const ADD_WEIGHT_LOADING_OUT = '[WeightLoading] Add Weight Loading OUT';
export const UPDATE_WEIGHT_LOADING = '[WeightLoading] Update Weight Loading';

export const SET_WEIGHT_LOADING_MODE = '[WeightLoading] Change Weight Loading Mode ';
export const SET_DEVICE_ACTIVE = '[Device] Set Device Active  ';
export const SET_DEVICE_STATE = '[Device] Set Device Port State  ';
export const SET_DEVICE_DATA = '[Device] Set Device Data  ';

export class SetRoute implements Action {
  readonly type = SET_ROUTE;

  constructor(public payload: string) {}
}

export class SetListWeightIn implements Action {
  readonly type = SET_LIST_WEIGHT_IN;
  constructor(public payload: Weighting[]) {}
}
export class SetListWeightOut implements Action {
  readonly type = SET_LIST_WEIGHT_OUT;
  constructor(public payload: Weighting[]) {}
}
export class SetListWeightDeleted implements Action {
  readonly type = SET_LIST_WEIGHT_DELETED;
  constructor(public payload: Weighting[]) {}
}

// export class SetWeightLoadingID implements Action {
//   readonly type = SET_WEIGHT_LOADING_ID;
//   constructor(public payload: number) {}
// }

// export class AddWeightLoadingIn implements Action {
//   readonly type = ADD_WEIGHT_LOADING_IN;
//   constructor(public payload: Weighting) {}
// }

// export class AddWeightLoadingOut implements Action {
//   readonly type = ADD_WEIGHT_LOADING_OUT;
//   constructor(public payload: Weighting) {}
// }

export class SetWeightLoadingMode implements Action {
  readonly type = SET_WEIGHT_LOADING_MODE;
  constructor(public payload: 'auto' | 'manual') {}
}

export class SetDeviceActive implements Action {
  readonly type = SET_DEVICE_ACTIVE;
  constructor(public payload: Device) {}
}
export class SetDeviceState implements Action {
  readonly type = SET_DEVICE_STATE;
  constructor(public payload: { state: string; message: string }) {}
}
export class SetDeviceData implements Action {
  readonly type = SET_DEVICE_DATA;
  constructor(public payload: { state: string; data: WeightData; user: string }) {}
}

export type WeightLoadingActions =
  | SetRoute
  | SetListWeightIn
  | SetListWeightOut
  | SetListWeightDeleted
  // | SetWeightLoadingID
  // | AddWeightLoadingIn
  // | AddWeightLoadingOut
  | SetWeightLoadingMode
  | SetDeviceActive
  | SetDeviceState
  | SetDeviceData;
