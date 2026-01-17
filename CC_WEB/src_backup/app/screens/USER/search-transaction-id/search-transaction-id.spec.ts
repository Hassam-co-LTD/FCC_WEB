import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchTransactionID } from './search-transaction-id';

describe('SearchTransactionID', () => {
  let component: SearchTransactionID;
  let fixture: ComponentFixture<SearchTransactionID>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchTransactionID]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchTransactionID);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
