import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicalInfo } from './technical-info';

describe('TechnicalInfo', () => {
  let component: TechnicalInfo;
  let fixture: ComponentFixture<TechnicalInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicalInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnicalInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
