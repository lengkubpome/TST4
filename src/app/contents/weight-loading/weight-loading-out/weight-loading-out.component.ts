import { Note } from './../shared/note.model';
import { Product, Dummy_Product } from './../product.model';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Weighting } from './../weighting.model';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatBottomSheet } from '@angular/material';
import { Observable } from 'rxjs';
import { startWith, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BottomSheetNoteComponent } from '../shared/bottom-sheet-note.component';
import { forbiddenProducts } from '../shared/forbidden-products';

@Component({
  selector: 'tst-weight-loading-out',
  templateUrl: './weight-loading-out.component.html',
  styleUrls: ['./weight-loading-out.component.scss']
})
export class WeightLoadingOutComponent implements OnInit {

  weightLoading: Weighting;
  weightLoadingOutForm: FormGroup;

  price = 0;
  totalWeight = 0;
  cutWeight = 0;
  notes: Note[] = [];
  showCutWeight: boolean;

  products: Product[];
  filteredProducts: Observable<Product[]>;

  constructor(public dialogRef: MatDialogRef<WeightLoadingOutComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private noteBottomSheet: MatBottomSheet,
  ) {
    this.products = Dummy_Product;
  }

  ngOnInit() {
    this.weightLoading = this.data.weighting;

    console.log(this.weightLoading);


    this.weightLoadingOutForm = this.fb.group({
      car: [{ value: this.weightLoading.car, disabled: true }, Validators.required],
      customer: [{ value: this.weightLoading.customer, disabled: true }],
      product: [{ value: this.weightLoading.product, disabled: false }, Validators.compose([
        Validators.required,
        forbiddenProducts(this.products)
      ])],
      price: [{ value: this.weightLoading.price, disabled: false },
      Validators.compose([Validators.required])],
      type: [{ value: this.weightLoading.type, disabled: false }],
      weightIn: [{ value: this.weightLoading.weightIn, disabled: true }],
      weightOut: [{ value: 1000, disabled: true }],
      cutWeight: [{ value: 0, disabled: true }],
      totalWeight: [{ value: 0, disabled: true }],
      amount: [{ value: 0, disabled: true }],
      cutWeightInput: ['0'],
      cutWeightTypeUnit: ['kg'],
      cutWeightNote: [{ value: '', disabled: true }]

    });

    // initial Notes
    this.weightLoading.note !== undefined ?
      this.notes = this.weightLoading.note :
      this.notes = [];


    this.calculateWeightLoading();

    // Fillter Products
    this.filteredProducts = this.weightLoadingOutForm.get('product').valueChanges.pipe(
      startWith(''),
      map(product => product ? this.filterProducts(product) : this.products.slice())
    );

    // Type Change
    this.weightLoadingOutForm.get('type').valueChanges
      .subscribe(value => {
        if (value === 'sell') {
          this.showCutWeight = false;
          this.onResetCutWeight();
        } else {
          this.showCutWeight = this.showCutWeight;
        }
      });

    // Product Change
    this.weightLoadingOutForm.get('product').valueChanges
      .pipe(
        debounceTime(400),
    )
      .subscribe(res => {
        const product = this.products.find(item => item.name === res);
        return product !== undefined ?
          this.weightLoadingOutForm.get('price').setValue(product.price) :
          this.weightLoadingOutForm.get('price').setValue(0);

      });

    // Price Change
    this.weightLoadingOutForm.get('price').valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => this.calculateWeightLoading());

    // Weight Loading Out Change
    this.weightLoadingOutForm.get('weightOut').valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => this.calculateWeightLoading());

    // Cut Weight Input Change
    this.weightLoadingOutForm.get('cutWeightInput').valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(value => {
        if (value === 0 || value === null) {
          this.weightLoadingOutForm.get('cutWeightNote').disable();

        } else {
          this.weightLoadingOutForm.get('cutWeightNote').enable();
        }
        this.calculateCutWeight();
      });

    // Cut Weight Note Change
    this.weightLoadingOutForm.get('cutWeightNote').valueChanges
      .pipe(
        debounceTime(800),
        distinctUntilChanged()
      )
      .subscribe(() => this.calculateCutWeight());
    // Cut Weight Type Change
    this.weightLoadingOutForm.get('cutWeightTypeUnit').valueChanges
      .pipe(
        distinctUntilChanged()
      )
      .subscribe(() => this.calculateCutWeight());
  }


  private calculateCutWeight() {
    const value = this.weightLoadingOutForm.get('cutWeightInput').value;
    const unit = this.weightLoadingOutForm.get('cutWeightTypeUnit').value;
    const note = this.weightLoadingOutForm.get('cutWeightNote').value;
    if (unit === '%') {
      const totalWeight = Math.abs(this.weightLoadingOutForm.get('weightIn').value - this.weightLoadingOutForm.get('weightOut').value);

      this.cutWeight = - totalWeight * (value / 100);

    } else if (unit === 'kg') {
      this.cutWeight = -value;
    }

    this.cutWeight = Math.round(this.cutWeight); // ปัดทศนิยม
    this.weightLoadingOutForm.get('cutWeight').setValue(this.cutWeight);

    if (this.cutWeight !== 0) {
      const noteCutWeight = 'หักสิ่งเจือปน ' +
        Math.abs(this.cutWeight) + ' หน่วย (' + value + ' ' + unit + ') เนื่องจาก' + note;

      this.notes = this.notes.filter(res => res.type !== 'cutWeight');
      this.notes.push({ type: 'cutWeight', value: noteCutWeight });

    }
    this.calculateWeightLoading();

  }

  private calculateWeightLoading() {
    const weightIn = this.weightLoadingOutForm.get('weightIn').value;
    const weightOut = this.weightLoadingOutForm.get('weightOut').value;
    this.totalWeight = Math.abs(weightIn - weightOut) + this.cutWeight;

    this.weightLoadingOutForm.get('totalWeight').setValue(this.totalWeight);
    this.calculateAmount();
  }

  private calculateAmount() {
    this.totalWeight = this.weightLoadingOutForm.get('totalWeight').value;
    this.price = this.weightLoadingOutForm.get('price').value;
    const amount = Math.floor(this.totalWeight * this.price);

    this.weightLoadingOutForm.get('amount').setValue(amount);

  }


  onResetCutWeight() {
    this.cutWeight = 0;
    this.showCutWeight = false;

    this.notes = this.notes.filter(note => note.type !== 'cutWeight');

    this.weightLoadingOutForm.get('cutWeightInput').setValue(0);
    this.weightLoadingOutForm.get('cutWeightNote').setValue('');


  }


  filterProducts(val: any): Product[] {
    return this.products.filter(product =>
      product.name.indexOf(val) > -1 ||
      product.id.toString() === val);
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
    console.log('Submit');

  }

}
