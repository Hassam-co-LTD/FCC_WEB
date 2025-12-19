import { TestBed } from '@angular/core/testing';

import { ExportCollectionFormTransaction } from './export-collection-form-transaction';

describe('ExportCollectionFormTransaction', () => {
  let service: ExportCollectionFormTransaction;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportCollectionFormTransaction);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
