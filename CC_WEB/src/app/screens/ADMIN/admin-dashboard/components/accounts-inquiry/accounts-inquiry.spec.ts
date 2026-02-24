import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsInquiry } from './accounts-inquiry';

describe('AccountsInquiry', () => {
  let component: AccountsInquiry;
  let fixture: ComponentFixture<AccountsInquiry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountsInquiry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountsInquiry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
