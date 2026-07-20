import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingDetails } from './shipping-details';

describe('ShippingDetails', () => {
  let component: ShippingDetails;
  let fixture: ComponentFixture<ShippingDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShippingDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
