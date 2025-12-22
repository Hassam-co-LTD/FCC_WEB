import { TestBed } from '@angular/core/testing';

import { UndertakingIssuanceFormTransaction } from './undertaking-issuance-form-transaction';

describe('UndertakingIssuanceFormTransaction', () => {
  let service: UndertakingIssuanceFormTransaction;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UndertakingIssuanceFormTransaction);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
