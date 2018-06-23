import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PastWeightLoadingComponent } from './past-weight-loading.component';

describe('PastWeightLoadingComponent', () => {
  let component: PastWeightLoadingComponent;
  let fixture: ComponentFixture<PastWeightLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PastWeightLoadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PastWeightLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
