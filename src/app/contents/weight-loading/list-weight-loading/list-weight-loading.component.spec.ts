import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListWeightLoadingComponent } from './list-weight-loading.component';

describe('ListWeightLoadingComponent', () => {
  let component: ListWeightLoadingComponent;
  let fixture: ComponentFixture<ListWeightLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListWeightLoadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListWeightLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
