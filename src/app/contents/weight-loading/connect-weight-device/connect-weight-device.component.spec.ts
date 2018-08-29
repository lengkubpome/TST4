import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectWeightDeviceComponent } from './connect-weight-device.component';

describe('ConnectWeightDeviceComponent', () => {
  let component: ConnectWeightDeviceComponent;
  let fixture: ComponentFixture<ConnectWeightDeviceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectWeightDeviceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectWeightDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
