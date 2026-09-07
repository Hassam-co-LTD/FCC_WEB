import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantBeneficiary } from './applicant-beneficiary';

describe('ApplicantBeneficiary', () => {
  let component: ApplicantBeneficiary;
  let fixture: ComponentFixture<ApplicantBeneficiary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantBeneficiary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicantBeneficiary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
