import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeightLoadingInComponent } from './weight-loading-in.component';

describe('WeightLoadingInComponent', () => {
  let component: WeightLoadingInComponent;
  let fixture: ComponentFixture<WeightLoadingInComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeightLoadingInComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeightLoadingInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
