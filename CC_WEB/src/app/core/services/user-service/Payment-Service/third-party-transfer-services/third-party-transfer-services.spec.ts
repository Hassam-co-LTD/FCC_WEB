import { TestBed } from '@angular/core/testing';

import { ThirdPartyTransferServices } from './third-party-transfer-services';

describe('ThirdPartyTransferServices', () => {
  let service: ThirdPartyTransferServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThirdPartyTransferServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
