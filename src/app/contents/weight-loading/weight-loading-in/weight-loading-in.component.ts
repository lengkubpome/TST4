import { Note } from './../shared/note.model';
import { Weighting } from './../weighting.model';
import { WeightLoadingService } from '../weight-loading.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatBottomSheet, MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Product, Dummy_Product } from './../product.model';
import { BottomSheetNoteComponent } from '../shared/bottom-sheet-note.component';
import { forbiddenProducts } from '../shared/forbidden-products';

@Component({
  selector: 'tst-weight-loading-in',
  templateUrl: './weight-loading-in.component.html',
  styleUrls: ['./weight-loading-in.component.scss']
})
export class WeightLoadingInComponent implements OnInit {


  notes: Note[] = [];

  weightLoadingInForm: FormGroup;
  products: Product[];
  filteredProducts: Observable<Product[]>;

  constructor(
    public dialogRef: MatDialogRef<WeightLoadingInComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private noteBottomSheet: MatBottomSheet,
    private fb: FormBuilder,
    private weightLoadingService: WeightLoadingService) {
    this.products = Dummy_Product;
  }

  ngOnInit() {
    this.weightLoadingInForm = this.fb.group({
      car: [{ value: '', disabled: false }, Validators.required],
      customer: [{ value: '', disabled: false }],
      product: [{ value: '', disabled: false }, Validators.compose([
        Validators.required,
        forbiddenProducts(this.products)
      ])],
      price: [{ value: 0, disabled: false },
      Validators.compose([Validators.required])],
      type: [{ value: 'buy', disabled: false }],
      weightIn: [{ value: 0, disabled: true }],

    });


    // Product Change
    this.weightLoadingInForm.get('product').valueChanges
      .pipe(
        debounceTime(400),
      )
      .subscribe(res => {
        const product = this.products.find(item => item.name === res);
        return product !== undefined ?
          this.weightLoadingInForm.get('price').setValue(product.price) :
          this.weightLoadingInForm.get('price').setValue(0);

      });

    // Fillter Products
    this.filteredProducts = this.weightLoadingInForm.get('product').valueChanges.pipe(
      startWith(''),
      map(product => product ? this.filterProducts(product) : this.products.slice())
    );
  }

  filterProducts(val: any): Product[] {
    return this.products.filter(product =>
      product.name.indexOf(val) > -1 ||
      product.id.toString() === val);
  }

  onCancel() {
    this.dialogRef.close();
  }

  onShowNoteDetail(): void {
    const noteDetailRef = this.noteBottomSheet.open(BottomSheetNoteComponent, {
      disableClose: true,
      data: {
        notes: this.notes
      }
    });

    noteDetailRef.afterDismissed().subscribe(note => {
      if (note !== false) {
        this.notes = note;
      }

    });

  }

  onSubmit() {
    const weighting: Weighting = {
      id: '1',
      dateLoadIn: new Date(Date.now()),
      dateLoadOut: null,
      car: this.weightLoadingInForm.get('car').value,
      customer: this.weightLoadingInForm.get('customer').value,
      product: this.weightLoadingInForm.get('product').value,
      price: 0,
      weightIn: this.weightLoadingInForm.get('weightIn').value,
      weightOut: 0,
      totalWeight: 0,
      amount: 0,
      type: this.weightLoadingInForm.get('type').value,
      state: 'waiting',
      recorder: 'Tester', //TODO: แก้ไขผู้บันทึก
      note: this.notes
    };

    console.log(weighting);

    this.weightLoadingService.recordWeightLoading(weighting);
    this.dialogRef.close();
  }
}
