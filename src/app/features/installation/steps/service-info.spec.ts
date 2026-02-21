import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceInfo } from './service-info';

describe('ServiceInfo', () => {
  let component: ServiceInfo;
  let fixture: ComponentFixture<ServiceInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
