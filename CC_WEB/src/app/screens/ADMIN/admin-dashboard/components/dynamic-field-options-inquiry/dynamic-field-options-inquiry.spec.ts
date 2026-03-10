import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicFieldOptionsInquiry } from './dynamic-field-options-inquiry';

describe('DynamicFieldOptionsInquiry', () => {
  let component: DynamicFieldOptionsInquiry;
  let fixture: ComponentFixture<DynamicFieldOptionsInquiry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicFieldOptionsInquiry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicFieldOptionsInquiry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
