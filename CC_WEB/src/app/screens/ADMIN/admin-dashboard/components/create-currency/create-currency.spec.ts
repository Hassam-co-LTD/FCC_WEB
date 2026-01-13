import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCurrency } from './create-currency';

describe('CreateCurrency', () => {
  let component: CreateCurrency;
  let fixture: ComponentFixture<CreateCurrency>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCurrency]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCurrency);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
