import { TestBed } from '@angular/core/testing';

import { AccountTransfer } from './account-transfer';

describe('AccountTransfer', () => {
  let service: AccountTransfer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountTransfer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
