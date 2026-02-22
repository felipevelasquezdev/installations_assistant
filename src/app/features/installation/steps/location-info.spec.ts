import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationInfo } from './location-info';

describe('LocationInfo', () => {
  let component: LocationInfo;
  let fixture: ComponentFixture<LocationInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
