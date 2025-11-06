import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingGuaranteeScreen } from './shipping-guarantee-screen';

describe('ShippingGuaranteeScreen', () => {
  let component: ShippingGuaranteeScreen;
  let fixture: ComponentFixture<ShippingGuaranteeScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingGuaranteeScreen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShippingGuaranteeScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
