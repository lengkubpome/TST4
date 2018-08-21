import { CreateProductComponent } from './../create-product/create-product.component';
import { EditProductComponent } from './../edit-product/edit-product.component';
import { ProductService } from './../product.service';
import { MatTableDataSource, MatSort, MatDialog } from '@angular/material';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';

import { Product, Dummy_Product } from './../../../shared/models/product.model';

import * as prodcutAction from '../store/product.action';
import * as fromApp from '../../../app.reducer';

@Component({
  selector: 'tst-list-product',
  templateUrl: './list-product.component.html',
  styleUrls: ['./list-product.component.scss']
})
export class ListProductComponent implements OnInit, AfterViewInit {
  columnsToDisplay = ['name', 'price', 'function'];
  dataSource = new MatTableDataSource<Product>();
  expandedElement: Product;

  @ViewChild(MatSort) sort: MatSort;

  constructor(private dialog: MatDialog, private store: Store<fromApp.State>, private productService: ProductService) {
    this.productService.fetchListProduct();
  }

  ngOnInit() {
    this.store.select(fromApp.getListProduct).subscribe((products: Product[]) => {
      this.dataSource.data = products;
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onAddProduct() {
    this.dialog.open(CreateProductComponent, {
      width: '90%',
      maxWidth: '400px',
      autoFocus: true,
      disableClose: true
    });
  }

  onChangePrice(row: Product) {
    console.log(row);
    this.dialog.open(EditProductComponent, {
      data: { mode: 'changePrice', product: row }
    });
  }

  onEditProduct(row: Product) {
    console.log(row);
    this.dialog.open(EditProductComponent, {
      data: { mode: 'editProduct', product: row }
    });
  }
}
