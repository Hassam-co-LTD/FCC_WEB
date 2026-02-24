import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccoutTypesInquiry } from './accout-types-inquiry';

describe('AccoutTypesInquiry', () => {
  let component: AccoutTypesInquiry;
  let fixture: ComponentFixture<AccoutTypesInquiry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccoutTypesInquiry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccoutTypesInquiry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
