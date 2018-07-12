import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

import { WeightLoadingComponent } from './weight-loading.component';
import { ListWeightLoadingComponent } from './list-weight-loading/list-weight-loading.component';
import { PastWeightLoadingComponent } from './past-weight-loading/past-weight-loading.component';
import { WeightLoadingInComponent } from './weight-loading-in/weight-loading-in.component';
import { WeightLoadingOutComponent } from './weight-loading-out/weight-loading-out.component';
import { BottomSheetNoteComponent } from './shared/bottom-sheet-note.component';
import { DeleteWeightLoadingComponent } from './delete-weight-loading/delete-weight-loading.component';
import { CancelDialogComponent } from './weight-loading-out/alert-dialog.component';

import { WeightLoadingService } from './weight-loading.service';

import { StoreModule } from '@ngrx/store';
import { weightLoadingReducer } from './store/weight-loading.reducer';

const routes: Routes = [
  {
path: '', component: WeightLoadingComponent,
children: [
      { path: '', component: ListWeightLoadingComponent },
      { path: 'past-list', component: PastWeightLoadingComponent },
      { path: 'recently-deleted', component: DeleteWeightLoadingComponent }
    ]
  }

];

@NgModule({
  declarations: [
    WeightLoadingComponent,
    ListWeightLoadingComponent,
    PastWeightLoadingComponent,
    WeightLoadingInComponent,
    WeightLoadingOutComponent,
    BottomSheetNoteComponent,
    DeleteWeightLoadingComponent,
    CancelDialogComponent
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
  entryComponents: [WeightLoadingInComponent, WeightLoadingOutComponent, CancelDialogComponent, BottomSheetNoteComponent]
})
export class WeightLoadingModule { }
