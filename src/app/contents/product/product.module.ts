import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { ProductRoutingModule } from './product-routing.module';
import { ProductComponent } from './product.component';
import { ListProductComponent } from './list-product/list-product.component';

import { ProductService } from './product.service';
import { CreateProductComponent } from './create-product/create-product.component';
import { LogProductComponent } from './log-product/log-product.component';
import { InfoProductComponent } from './info-product/info-product.component';
import { DeleteProductComponent } from './info-product/delete/delete-product.component';

@NgModule({
  imports: [ReactiveFormsModule, SharedModule, ProductRoutingModule],
  declarations: [
    ProductComponent,
    ListProductComponent,
    CreateProductComponent,
    LogProductComponent,
    InfoProductComponent,
    DeleteProductComponent
  ],
  providers: [ProductService],
  entryComponents: [CreateProductComponent, InfoProductComponent, DeleteProductComponent]
})
export class ProductModule {}
