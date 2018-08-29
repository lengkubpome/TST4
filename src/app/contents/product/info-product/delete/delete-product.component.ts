import { Product } from '../../../../shared/models/product.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'tst-delete-product',
  templateUrl: './delete-product.component.html',
  styleUrls: ['./delete-product.component.scss']
})
export class DeleteProductComponent implements OnInit {
  isAccess = false;

  constructor(private dialogRef: MatDialogRef<DeleteProductComponent>, @Inject(MAT_DIALOG_DATA) public data: Product) {}

  ngOnInit() {
    if (!this.data.active) this.isAccess = true;
  }
}
