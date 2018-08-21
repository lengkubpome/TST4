import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../../shared/shared.module';
import { NgModule } from '@angular/core';

import { VendorRoutingModule } from './vendor-routing.module';
import { VendorComponent } from './vendor.component';

@NgModule({
  imports: [
    ReactiveFormsModule,
    SharedModule,
    VendorRoutingModule
  ],
  declarations: [VendorComponent]
})
export class VendorModule { }
