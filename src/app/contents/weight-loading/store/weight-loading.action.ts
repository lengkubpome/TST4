import { Action } from '@ngrx/store';
import { Weighting } from '../weighting.model';

export const SET_LIST_WEIGHT_LOADING = '[WeightLoading] Set List Weight Loading';
export const ADD_WEIGHT_LOADING_IN = '[WeightLoading] Add Weight Loading IN';
export const ADD_WEIGHT_LOADING_OUT = '[WeightLoading] Add Weight Loading OUT';
export const UPDATE_WEIGHT_LOADING = '[WeightLoading] Update Weight Loading';

export class SetListWeightLoading implements Action {
  readonly type = SET_LIST_WEIGHT_LOADING;
  constructor(public payload: Weighting[]) { }
}

export class AddWeightLoadingIn implements Action {
  readonly type = ADD_WEIGHT_LOADING_IN;
  constructor(public payload: Weighting) { }
}

export class AddWeightLoadingOut implements Action {
  readonly type = ADD_WEIGHT_LOADING_OUT;
  constructor(public payload: { id: number, weihgt: Weighting }) { }
}

export type WeightLoadingActions =
  SetListWeightLoading |
  AddWeightLoadingIn |
  AddWeightLoadingOut;
