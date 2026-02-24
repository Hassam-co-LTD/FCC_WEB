import { TestBed } from '@angular/core/testing';

import { ShippingGuaranteeFormTransactionService } from '../shipping-guarantee-form-transaction-service/shipping-guarantee-form-transaction-service';

describe('ShippingGuaranteeFormTransactionService', () => {
  let service: ShippingGuaranteeFormTransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShippingGuaranteeFormTransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
