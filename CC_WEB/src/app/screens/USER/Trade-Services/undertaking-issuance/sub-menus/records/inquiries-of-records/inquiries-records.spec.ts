import { ComponentFixture, TestBed } from '@angular/core/testing';

import { inquiriesRecords } from './inquiries-records';

describe('inquiriesRecords', () => {
  let component: inquiriesRecords;
  let fixture: ComponentFixture<inquiriesRecords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [inquiriesRecords]
    })
    .compileComponents();

    fixture = TestBed.createComponent(inquiriesRecords);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
