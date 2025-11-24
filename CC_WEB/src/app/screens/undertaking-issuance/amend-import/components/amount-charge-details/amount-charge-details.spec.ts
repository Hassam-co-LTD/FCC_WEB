import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmountChargeDetails } from './amount-charge-details';

describe('AmountChargeDetails', () => {
  let component: AmountChargeDetails;
  let fixture: ComponentFixture<AmountChargeDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmountChargeDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmountChargeDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
