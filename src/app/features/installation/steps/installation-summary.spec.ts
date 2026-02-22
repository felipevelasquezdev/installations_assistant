import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallationSummary } from './installation-summary';

describe('InstallationSummary', () => {
  let component: InstallationSummary;
  let fixture: ComponentFixture<InstallationSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstallationSummary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstallationSummary);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
