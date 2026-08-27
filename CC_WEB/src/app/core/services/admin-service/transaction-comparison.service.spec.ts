import { TestBed } from '@angular/core/testing';

import { TransactionComparisonService } from './transaction-comparison.service';

describe('TransactionComparisonService', () => {
  let service: TransactionComparisonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionComparisonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
