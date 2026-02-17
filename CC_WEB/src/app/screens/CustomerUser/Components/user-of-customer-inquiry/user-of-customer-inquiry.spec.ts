import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserOfCustomerInquiry } from './user-of-customer-inquiry';

describe('UserOfCustomerInquiry', () => {
  let component: UserOfCustomerInquiry;
  let fixture: ComponentFixture<UserOfCustomerInquiry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserOfCustomerInquiry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserOfCustomerInquiry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
