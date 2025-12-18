import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmittedRecords } from './submitted-records';

describe('SubmittedRecords', () => {
  let component: SubmittedRecords;
  let fixture: ComponentFixture<SubmittedRecords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmittedRecords]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmittedRecords);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
