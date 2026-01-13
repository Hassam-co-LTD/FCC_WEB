import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyList } from './currency-list';

describe('CurrencyList', () => {
  let component: CurrencyList;
  let fixture: ComponentFixture<CurrencyList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrencyList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrencyList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
