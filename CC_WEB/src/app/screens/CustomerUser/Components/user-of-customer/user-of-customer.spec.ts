import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserOfCustomer } from './user-of-customer';

describe('UserOfCustomer', () => {
  let component: UserOfCustomer;
  let fixture: ComponentFixture<UserOfCustomer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserOfCustomer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserOfCustomer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
