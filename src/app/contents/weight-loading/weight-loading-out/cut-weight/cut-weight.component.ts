import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'tst-botton-sheet-cut-weight',
  templateUrl: './cut-weight.component.html',
  styleUrls: ['./cut-weight.component.scss']
})
export class CutWeightComponent implements OnInit {
  cutWeightForm: FormGroup;
  cutWeight: { value: number; unitType: string; note: string };
  editMode = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CutWeightComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.cutWeight = this.data.cutWeight;
    if (this.cutWeight === null) {
      this.cutWeight = { value: 0, unitType: 'kg', note: '' };
    }

    this.cutWeightForm = this.fb.group({
      value: [this.cutWeight.value, Validators.compose([Validators.min(1), Validators.pattern('^(0|[1-9][0-9]*)$')])],
      unitType: [this.cutWeight.unitType, Validators.required],
      note: [this.cutWeight.note, Validators.required]
    });

    if (this.cutWeight.value !== 0) {
      this.editMode = true;
    }
  }

  onSubmit() {
    this.dialogRef.close(this.cutWeightForm.value);
  }

  onClose(){
    this.dialogRef.close();
  }

  onDelete() {
    this.dialogRef.close('delete');
  }
}
