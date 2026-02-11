import { TestBed } from '@angular/core/testing';

import { UndertakingIssuanceService } from '../../user-service/Sharing-search-service/undertaking-issuance-form-transaction';

describe('UndertakingIssuanceFormTransaction', () => {
  let service: UndertakingIssuanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UndertakingIssuanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
