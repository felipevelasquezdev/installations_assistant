import { TestBed } from '@angular/core/testing';

import { SummaryFormatter } from './summary-formatter';

describe('SummaryFormatter', () => {
  let service: SummaryFormatter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SummaryFormatter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
