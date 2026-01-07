import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnquiriesOfRecords } from './enquiries-of-records';

describe('EnquiriesOfRecords', () => {
  let component: EnquiriesOfRecords;
  let fixture: ComponentFixture<EnquiriesOfRecords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnquiriesOfRecords]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnquiriesOfRecords);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
