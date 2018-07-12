import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'tst-cancel-weight-loading',
  template: `
            <mat-dialog-content>
              <p>คุณต้องการยกเลิกการชั่งน้ำหนัก</p>
            </mat-dialog-content>
            <mat-dialog-actions fxLayout="row" fxLayoutAlign="center center">
              <button mat-button color="warn" [mat-dialog-close]="true">ลบ</button>
              <button mat-button [mat-dialog-close]="false" cdkFocusInitial>ไม่</button>
            </mat-dialog-actions>
  `
})
export class CancelDialogComponent implements OnInit {
  constructor() { }

  ngOnInit(): void { }
}
