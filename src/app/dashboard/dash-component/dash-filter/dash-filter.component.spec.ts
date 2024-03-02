import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashFilterComponent } from './dash-filter.component';

describe('DashFilterComponent', () => {
  let component: DashFilterComponent;
  let fixture: ComponentFixture<DashFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
