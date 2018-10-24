import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WelcomeComponent } from './contents/welcome/welcome.component';

const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'weight-loadings', loadChildren: './contents/weight-loading/weight-loading.module#WeightLoadingModule' },
  { path: 'business', loadChildren: './contents/business/business.module#BusinessModule' },
  { path: 'vendor', loadChildren: './contents/vendor/vendor.module#VendorModule' },
  { path: 'product', loadChildren: './contents/product/product.module#ProductModule' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRountingModule {}
