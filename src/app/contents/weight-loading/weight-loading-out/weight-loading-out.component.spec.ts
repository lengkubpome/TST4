import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeightLoadingOutComponent } from './weight-loading-out.component';

describe('WeightLoadingOutComponent', () => {
  let component: WeightLoadingOutComponent;
  let fixture: ComponentFixture<WeightLoadingOutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeightLoadingOutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeightLoadingOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
