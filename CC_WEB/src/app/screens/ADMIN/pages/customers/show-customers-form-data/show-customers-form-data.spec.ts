import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowCustomersFormData } from './show-customers-form-data';

describe('ShowCustomersFormData', () => {
  let component: ShowCustomersFormData;
  let fixture: ComponentFixture<ShowCustomersFormData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowCustomersFormData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowCustomersFormData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
