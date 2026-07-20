import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedInquiryRecords } from './approved-inquiry-records';

describe('ApprovedInquiryRecords', () => {
  let component: ApprovedInquiryRecords;
  let fixture: ComponentFixture<ApprovedInquiryRecords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovedInquiryRecords]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovedInquiryRecords);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
