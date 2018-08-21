import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogProductComponent } from './log-product.component';

describe('LogProductComponent', () => {
  let component: LogProductComponent;
  let fixture: ComponentFixture<LogProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
