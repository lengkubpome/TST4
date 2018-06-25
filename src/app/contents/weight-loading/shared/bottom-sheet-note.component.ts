import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material';

@Component({
  template: `
    <mat-nav-list fxLayout="column">

      <mat-form-field mat-list-item  appearance="outline" fxFill>
        <mat-label>หมายเหตุ</mat-label>
        <textarea matInput placeholder="รายละเอียด" [(ngModel)]="currentNote"></textarea>
      </mat-form-field>

      <mat-list-item *ngFor="let note of notCurrentNote" style="margin-top: -15px;">
        <span style="color: rgba(0,0,0,.75);" > <strong>เพิ่มเติม: </strong> {{note.value}}</span>
      </mat-list-item>
  </mat-nav-list>
  <div mat-list-item fxLayout="row" fxLayoutAlign="center start">
      <button mat-button color="primary" (click)="onSave()">บันทึก</button>
      <button mat-button (click)="onClose()" >ปิด</button>
    </div>
    `,
  // styleUrls: ['./name.component.scss']
})
export class BottomSheetNoteComponent implements OnInit {
  notes: Note[] = [];
  notCurrentNote: Note[] = [];
  currentNote = '';

  cutWeightNote = '';

  constructor(private bottomSheetRef: MatBottomSheetRef,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any) { }

  ngOnInit(): void {
    this.notes = this.data.notes;

    this.notes.forEach(note => {
      if (note.type === 'note') {
        this.currentNote = note.value;
      } else {
        this.notCurrentNote.push(note);
      }
    });
  }

  onSave() {

    this.notes = this.notes.filter(res => res.type !== 'note');
    if (this.currentNote !== '') {
      this.notes.push({ type: 'note', value: this.currentNote });
    }

    this.bottomSheetRef.dismiss(this.notes);
  }

  onClose() {
    this.bottomSheetRef.dismiss(false);
  }
}


interface Note {
  type: string;
  value: string;
}

