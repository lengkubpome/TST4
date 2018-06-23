import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material';

@Component({
    template: `
    <mat-nav-list fxLayout="column">

      <mat-form-field mat-line appearance="outline" fxFill>
        <mat-label>หมายเหตุ</mat-label>
        <textarea matInput placeholder="รายละเอียด" [(ngModel)]="currentNote"></textarea>

        <span *ngIf="cutWeightNote !== ''">{{ cutWeightNote }}</span>

      </mat-form-field>




    <div mat-list-item fxLayout="row" fxLayoutAlign="center start">
      <button mat-button color="primary" (click)="onSave()">บันทึก</button>
      <button mat-button (click)="onClose()" >ปิด</button>
    </div>


  </mat-nav-list>
    `,
    // styleUrls: ['./name.component.scss']
})
export class BottomSheetNoteComponent implements OnInit {
    currentNote = '';
    cutWeightNote = '';

    constructor(private bottomSheetRef: MatBottomSheetRef,
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: any) { }

    ngOnInit(): void {
        this.currentNote = this.data.note1;
        this.cutWeightNote = this.data.note2;
    }

    onSave() {
        const noteDetail = { note1: this.currentNote, note2: this.cutWeightNote };

        this.bottomSheetRef.dismiss(noteDetail);
    }

    onClose() {
        this.bottomSheetRef.dismiss(false);
    }
}
