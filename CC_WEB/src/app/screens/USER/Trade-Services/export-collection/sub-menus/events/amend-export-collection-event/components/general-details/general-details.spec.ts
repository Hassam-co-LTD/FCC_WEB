import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralDetails } from './general-details';

describe('GeneralDetails', () => {
  let component: GeneralDetails;
  let fixture: ComponentFixture<GeneralDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
