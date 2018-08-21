import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MaterialModule } from './material.module';

// Directive
import { InputTrimModule } from 'ng2-trim-directive';

@NgModule({

  imports: [
    CommonModule,
    // FormsModule,
    MaterialModule,
    FlexLayoutModule,
    InputTrimModule,

  ],
  exports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    FlexLayoutModule,
    InputTrimModule
  ]
})
export class SharedModule { }
