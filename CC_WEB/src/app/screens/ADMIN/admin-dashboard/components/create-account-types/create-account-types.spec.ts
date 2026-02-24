import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAccountTypes } from './create-account-types';

describe('CreateAccountTypes', () => {
  let component: CreateAccountTypes;
  let fixture: ComponentFixture<CreateAccountTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAccountTypes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAccountTypes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
