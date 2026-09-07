import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InquiriesOfRecords } from './inquiries-of-records';

describe('InquiriesOfRecords', () => {
  let component: InquiriesOfRecords;
  let fixture: ComponentFixture<InquiriesOfRecords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InquiriesOfRecords]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InquiriesOfRecords);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
