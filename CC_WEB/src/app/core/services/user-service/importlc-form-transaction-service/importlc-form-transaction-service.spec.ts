import { TestBed } from '@angular/core/testing';

import { ImportlcFormTransactionService } from './importlc-form-transaction-service';

describe('ImportlcFormTransactionService', () => {
  let service: ImportlcFormTransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImportlcFormTransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
