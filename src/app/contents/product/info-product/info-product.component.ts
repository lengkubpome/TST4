import { ProductService } from './../product.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { Product, ProductChangeLog } from './../../../shared/models/product.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { forbiddenProducts } from '../../../shared/custom-validator-fn/validator-products';
import { Store } from '@ngrx/store';

import * as fromApp from '../../../app.reducer';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { DeleteProductComponent } from './delete/delete-product.component';

@Component({
  selector: 'tst-info-product',
  templateUrl: './info-product.component.html',
  styleUrls: ['./info-product.component.scss']
  // encapsulation: ViewEncapsulation.None
})
export class InfoProductComponent implements OnInit {
  infoProductForm: FormGroup;
  products: Product[] = [];
  productLog: ProductChangeLog[] = [];
  mode: null | 'edit' | 'delete' = null;
  canEdit = false;

  constructor(
    private dialogRef: MatDialogRef<InfoProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private store: Store<fromApp.State>,
    private productService: ProductService
  ) {
    // show product change log
    this.store.select(fromApp.getProductLog).subscribe((log: ProductChangeLog[]) => {
      this.productLog = log.filter(l => l.product === this.data && l.state !== 'Deleted');
      console.log(log);

    });

    // เช็ครายชื่อสินค้าในกรณีเปลี่ยนแปลงชื่อที่จะไม่ซ้ำกัน
    this.store.select(fromApp.getListProduct).subscribe((products: Product[]) => {
      // collect only product is not enough this currect product
      this.products = products.filter(p => p.name !== data.name);
    });
  }

  ngOnInit() {
    this.infoProductForm = this.fb.group({
      id: { value: this.data.id, disabled: true },
      active: { value: this.data.active, disabled: true },
      name: [
        { value: this.data.name, disabled: true },
        Validators.compose([Validators.required, forbiddenProducts(this.products)])
      ],
      price: [{ value: this.data.price, disabled: true }, Validators.required]
    });


    // check product is changed
    this.infoProductForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(formValue => {
        let isChanged = false;
        Object.entries(formValue).forEach(([key, value]) => {
          if (this.data[key] !== value) isChanged = true;
        });
        this.canEdit = isChanged;
      });
  }

  onEditMode() {
    this.mode = 'edit';
    this.infoProductForm.get('active').enable();
    this.infoProductForm.get('name').enable();
    this.infoProductForm.get('price').enable();
  }

  onDeleteMode() {
    const dialogDeleteRef = this.dialog.open(DeleteProductComponent, {
      disableClose: false,
      data: this.data
    });

    dialogDeleteRef.afterClosed().subscribe(result => {
      if (result) {
        this.productService.deleteProduct(this.data);
        this.dialogRef.close(this.data);
      }
    });
  }

  onNormalMode() {
    this.mode = null;
    this.infoProductForm.setValue({
      id: this.data.id,
      active: this.data.active,
      name: this.data.name,
      price: this.data.price
    });
    this.infoProductForm.get('active').disable();
    this.infoProductForm.get('name').disable();
    this.infoProductForm.get('price').disable();
  }

  onSaveEditProduct() {
    const productChange = { id: this.data.id, ...this.infoProductForm.value };

    this.productService.editProduct(this.data, productChange);
    this.data = productChange;

    this.mode = null;
    this.infoProductForm.get('active').disable();
    this.infoProductForm.get('name').disable();
    this.infoProductForm.get('price').disable();
  }

}
