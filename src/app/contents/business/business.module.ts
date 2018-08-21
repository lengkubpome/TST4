import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BusinessRoutingModule } from './business-routing.module';
import { BusinessComponent } from './business.component';

import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    ReactiveFormsModule,
    SharedModule,
    BusinessRoutingModule
  ],
  declarations: [BusinessComponent]
})
export class BusinessModule { }
