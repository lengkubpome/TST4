import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../../shared/shared.module';

import { WeightLoadingComponent } from './weight-loading.component';
import { ListWeightLoadingComponent } from './list-weight-loading/list-weight-loading.component';
import { PastWeightLoadingComponent } from './past-weight-loading/past-weight-loading.component';
import { WeightLoadingInComponent } from './weight-loading-in/weight-loading-in.component';
import { WeightLoadingOutComponent } from './weight-loading-out/weight-loading-out.component';

import { WeightLoadingService } from './weight-loading.service';

import { StoreModule } from '@ngrx/store';
import { weightLoadingReducer } from './store/weight-loading.reducer';
import { BottomSheetNoteComponent } from './shared/bottom-sheet-note.component';

const routes: Routes = [
  { path: '', component: WeightLoadingComponent }
];

@NgModule({
  declarations: [
    WeightLoadingComponent,
    ListWeightLoadingComponent,
    PastWeightLoadingComponent,
    WeightLoadingInComponent,
    WeightLoadingOutComponent,
    BottomSheetNoteComponent
  ],
  imports: [
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('weightLoading', weightLoadingReducer)

  ],
  providers: [
    WeightLoadingService
  ],
  exports: [],
  entryComponents: [WeightLoadingInComponent, WeightLoadingOutComponent , BottomSheetNoteComponent]
})
export class WeightLoadingModule { }
