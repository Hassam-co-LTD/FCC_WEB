import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UndertakingDetails } from './undertaking-details';

describe('UndertakingDetails', () => {
  let component: UndertakingDetails;
  let fixture: ComponentFixture<UndertakingDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UndertakingDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UndertakingDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
