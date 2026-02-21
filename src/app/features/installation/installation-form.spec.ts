import { TestBed } from '@angular/core/testing';

import { InstallationForm } from './installation-form';

describe('InstallationForm', () => {
  let service: InstallationForm;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstallationForm);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
