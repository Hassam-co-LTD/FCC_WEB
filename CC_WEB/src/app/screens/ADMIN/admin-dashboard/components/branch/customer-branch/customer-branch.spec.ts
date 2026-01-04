import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerBranch } from './customer-branch';

describe('CustomerBranch', () => {
  let component: CustomerBranch;
  let fixture: ComponentFixture<CustomerBranch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerBranch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerBranch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
