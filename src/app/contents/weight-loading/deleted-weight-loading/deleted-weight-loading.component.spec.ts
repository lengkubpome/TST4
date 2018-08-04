import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedWeightLoadingComponent } from './deleted-weight-loading.component';

describe('DeleteWeightLoadingComponent', () => {
  let component: DeletedWeightLoadingComponent;
  let fixture: ComponentFixture<DeletedWeightLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DeletedWeightLoadingComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeletedWeightLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
