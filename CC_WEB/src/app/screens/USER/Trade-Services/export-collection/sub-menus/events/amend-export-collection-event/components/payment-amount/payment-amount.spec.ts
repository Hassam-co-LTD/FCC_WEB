import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentAmount } from './payment-amount';

describe('PaymentAmount', () => {
  let component: PaymentAmount;
  let fixture: ComponentFixture<PaymentAmount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentAmount]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentAmount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
