import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InquiryOfFundtransferRecords } from './inquiry-of-fundtransfer-records';

describe('InquiryOfFundtransferRecords', () => {
  let component: InquiryOfFundtransferRecords;
  let fixture: ComponentFixture<InquiryOfFundtransferRecords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InquiryOfFundtransferRecords]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InquiryOfFundtransferRecords);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
