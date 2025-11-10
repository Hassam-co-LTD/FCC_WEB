import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingGuarantee } from './shipping-guarantee-screen';

describe('ShippingGuarantee', () => {
  let component: ShippingGuarantee;
  let fixture: ComponentFixture<ShippingGuarantee>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingGuarantee]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShippingGuarantee);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
