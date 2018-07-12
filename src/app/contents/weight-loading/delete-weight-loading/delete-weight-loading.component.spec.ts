import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteWeightLoadingComponent } from './delete-weight-loading.component';

describe('DeleteWeightLoadingComponent', () => {
  let component: DeleteWeightLoadingComponent;
  let fixture: ComponentFixture<DeleteWeightLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DeleteWeightLoadingComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteWeightLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
