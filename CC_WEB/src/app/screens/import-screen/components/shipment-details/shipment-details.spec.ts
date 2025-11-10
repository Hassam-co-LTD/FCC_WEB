import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentDetails } from './shipment-details';

describe('ShipmentDetails', () => {
  let component: ShipmentDetails;
  let fixture: ComponentFixture<ShipmentDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipmentDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
