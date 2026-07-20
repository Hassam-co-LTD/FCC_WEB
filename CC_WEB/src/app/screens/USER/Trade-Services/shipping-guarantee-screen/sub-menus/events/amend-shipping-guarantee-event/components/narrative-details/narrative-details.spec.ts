import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NarrativeDetails } from './narrative-details';

describe('NarrativeDetails', () => {
  let component: NarrativeDetails;
  let fixture: ComponentFixture<NarrativeDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NarrativeDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NarrativeDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
