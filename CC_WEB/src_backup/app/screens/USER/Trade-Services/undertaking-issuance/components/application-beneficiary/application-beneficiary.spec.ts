import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationBeneficiary } from './application-beneficiary';

describe('ApplicationBeneficiary', () => {
  let component: ApplicationBeneficiary;
  let fixture: ComponentFixture<ApplicationBeneficiary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationBeneficiary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationBeneficiary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
