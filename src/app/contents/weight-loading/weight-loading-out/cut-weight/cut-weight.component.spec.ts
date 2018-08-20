/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CutWeightComponent } from './cut-weight.component';

describe('BottonSheetCutWeightComponent', () => {
  let component: CutWeightComponent;
  let fixture: ComponentFixture<CutWeightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CutWeightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CutWeightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
