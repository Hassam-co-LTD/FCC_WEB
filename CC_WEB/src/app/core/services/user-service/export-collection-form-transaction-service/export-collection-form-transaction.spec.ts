import { TestBed } from '@angular/core/testing';

import { ExportCollectionFormTransactionService } from './export-collection-form-transaction';

describe('ExportCollectionFormTransactionService', () => {
  let service: ExportCollectionFormTransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportCollectionFormTransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
