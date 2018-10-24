import { InfoProductComponent } from './../info-product/info-product.component';
import { CreateProductComponent } from './../create-product/create-product.component';
import { ProductService } from './../product.service';
import { MatTableDataSource, MatSort, MatDialog } from '@angular/material';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';

import { Product,  } from './../../../shared/models/product.model';

import * as fromApp from '../../../app.reducer';

@Component({
  selector: 'tst-list-product',
  templateUrl: './list-product.component.html',
  styleUrls: ['./list-product.component.scss']
})
export class ListProductComponent implements OnInit, AfterViewInit {
  columnsToDisplay = ['name', 'price', 'status', 'function'];
  dataSource = new MatTableDataSource<Product>();
  expandedElement: Product;

  editProduct: Product = null;
  @ViewChild('changePrice') changePrice: ElementRef;

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

  onChangePrice(element: Product) {
    const newPrice = +this.changePrice.nativeElement.value;
    const productChange: Product = { ...element, price: newPrice };

    if (element.price !== newPrice) {
      this.productService.editProduct(element, productChange);
    }
    this.editProduct = null;
  }

  onInfoProduct(product: Product) {
    this.dialog.open(InfoProductComponent, {
      width: '90%',
      maxWidth: '400px',
      data: product
    });
  }
}
