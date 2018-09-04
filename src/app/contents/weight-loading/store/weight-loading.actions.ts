import { Device } from './../shared/device.model';
import { Action } from '@ngrx/store';
import { Weighting } from '../../../shared/models/weighting.model';


export const SET_ROUTE = '[Route] Set Route';
export const SET_LIST_WEIGHT_LOADING = '[WeightLoading] Set List Weight Loading';
export const SET_WEIGHT_LOADING_ID = '[WeightLoading] Set Weight Loading ID';
export const ADD_WEIGHT_LOADING_IN = '[WeightLoading] Add Weight Loading IN';
export const ADD_WEIGHT_LOADING_OUT = '[WeightLoading] Add Weight Loading OUT';
export const UPDATE_WEIGHT_LOADING = '[WeightLoading] Update Weight Loading';

export const SET_WEIGHT_LOADING_MODE = '[WeightLoading] Change Weight Loading Mode ';
export const SET_DEVICE_PORT_STATE = '[Device] Set Device Port State  ';


export class SetRoute implements Action {
  readonly type = SET_ROUTE;

  constructor(public payload: string) { }
}

export class SetListWeightLoading implements Action {
  readonly type = SET_LIST_WEIGHT_LOADING;
  constructor(public payload: Weighting[]) { }
}

export class SetWeightLoadingID implements Action {
  readonly type = SET_WEIGHT_LOADING_ID;
  constructor(public payload: number) { }
}

export class AddWeightLoadingIn implements Action {
  readonly type = ADD_WEIGHT_LOADING_IN;
  constructor(public payload: Weighting) { }
}

export class AddWeightLoadingOut implements Action {
  readonly type = ADD_WEIGHT_LOADING_OUT;
  constructor(public payload: Weighting) { }
}

export class SetWeightLoadingMode implements Action {
  readonly type = SET_WEIGHT_LOADING_MODE;
  constructor(public payload: 'auto' | 'manual') { }
}

export class SetStateDevice implements Action {
  readonly type = SET_DEVICE_PORT_STATE;
  constructor(public payload: string) { }
}


export type WeightLoadingActions =
  SetRoute |
  SetListWeightLoading |
  SetWeightLoadingID |
  AddWeightLoadingIn |
  AddWeightLoadingOut |
  SetWeightLoadingMode |
  SetStateDevice ;
