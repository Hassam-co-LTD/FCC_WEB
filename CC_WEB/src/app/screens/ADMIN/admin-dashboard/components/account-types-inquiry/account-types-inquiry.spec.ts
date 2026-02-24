import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountTypesInquiry } from './account-types-inquiry';

describe('AccountTypesInquiry', () => {
  let component: AccountTypesInquiry;
  let fixture: ComponentFixture<AccountTypesInquiry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountTypesInquiry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountTypesInquiry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
