import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedRecords } from './approved-records';

describe('ApprovedRecords', () => {
  let component: ApprovedRecords;
  let fixture: ComponentFixture<ApprovedRecords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovedRecords]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovedRecords);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
