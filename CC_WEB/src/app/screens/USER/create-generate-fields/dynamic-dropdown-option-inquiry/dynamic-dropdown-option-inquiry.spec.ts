import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicDropdownOptionInquiry } from './dynamic-dropdown-option-inquiry';

describe('DynamicDropdownOptionInquiry', () => {
  let component: DynamicDropdownOptionInquiry;
  let fixture: ComponentFixture<DynamicDropdownOptionInquiry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicDropdownOptionInquiry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicDropdownOptionInquiry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
