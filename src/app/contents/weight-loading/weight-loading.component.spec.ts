import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeightLoadingComponent } from './weight-loading.component';

describe('WeightLoadingComponent', () => {
  let component: WeightLoadingComponent;
  let fixture: ComponentFixture<WeightLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeightLoadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeightLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
