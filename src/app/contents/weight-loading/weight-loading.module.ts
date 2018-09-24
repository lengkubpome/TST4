import { AddWeightDeviceComponent } from './connect-weight-device/add-weight-device/add-weight-device.component';
import { DeviceService } from './shared/device.service';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

import { WeightLoadingComponent } from './weight-loading.component';
import { ListWeightLoadingComponent } from './list-weight-loading/list-weight-loading.component';
import { PastWeightLoadingComponent } from './past-weight-loading/past-weight-loading.component';
import { WeightLoadingInComponent } from './weight-loading-in/weight-loading-in.component';
import { WeightLoadingOutComponent } from './weight-loading-out/weight-loading-out.component';
import { CutWeightComponent } from './weight-loading-out/cut-weight/cut-weight.component';
import { DeletedWeightLoadingComponent } from './deleted-weight-loading/deleted-weight-loading.component';
import { CancelDialogComponent } from './weight-loading-out/alert-dialog.component';
import { ConnectWeightDeviceComponent } from './connect-weight-device/connect-weight-device.component';

import { WeightLoadingService } from './weight-loading.service';
import { WeightPrintService } from './shared/weight-print.service';

import { StoreModule } from '@ngrx/store';
import { weightLoadingReducer } from './store/weight-loading.reducer';

const routes: Routes = [
  {
    path: '',
    component: WeightLoadingComponent,
    children: [
      { path: '', component: ListWeightLoadingComponent },
      { path: 'past-list', component: PastWeightLoadingComponent },
      { path: 'recently-deleted', component: DeletedWeightLoadingComponent },
      { path: 'settings-device', component: ConnectWeightDeviceComponent }
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
    CutWeightComponent,
    DeletedWeightLoadingComponent,
    CancelDialogComponent,
    ConnectWeightDeviceComponent,
    AddWeightDeviceComponent
  ],
  imports: [
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('weightLoading', weightLoadingReducer)

  ],
  providers: [WeightLoadingService, WeightPrintService, DeviceService],
  exports: [],
  entryComponents: [
    WeightLoadingInComponent,
    WeightLoadingOutComponent,
    CancelDialogComponent,
    CutWeightComponent,
  ]
})
export class WeightLoadingModule { }
