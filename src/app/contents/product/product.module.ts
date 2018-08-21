import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { ProductRoutingModule } from './product-routing.module';
import { ProductComponent } from './product.component';
import { ListProductComponent } from './list-product/list-product.component';

import { ProductService } from './product.service';
import { CreateProductComponent } from './create-product/create-product.component';
import { EditProductComponent } from './edit-product/edit-product.component';
import { DeleteProductComponent } from './delete-product/delete-product.component';
import { LogProductComponent } from './log-product/log-product.component';

@NgModule({
  imports: [ReactiveFormsModule, SharedModule, ProductRoutingModule],
  declarations: [
    ProductComponent,
    ListProductComponent,
    CreateProductComponent,
    EditProductComponent,
    DeleteProductComponent,
    LogProductComponent
  ],
  providers: [ProductService],
  entryComponents: [CreateProductComponent, EditProductComponent, DeleteProductComponent]
})
export class ProductModule {}
