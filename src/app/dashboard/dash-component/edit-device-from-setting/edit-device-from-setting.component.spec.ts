import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDeviceFromSettingComponent } from './edit-device-from-setting.component';

describe('EditDeviceFromSettingComponent', () => {
  let component: EditDeviceFromSettingComponent;
  let fixture: ComponentFixture<EditDeviceFromSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditDeviceFromSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditDeviceFromSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
