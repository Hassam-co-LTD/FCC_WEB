import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppovedRecords } from './appoved-records';

describe('AppovedRecords', () => {
  let component: AppovedRecords;
  let fixture: ComponentFixture<AppovedRecords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppovedRecords]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppovedRecords);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
