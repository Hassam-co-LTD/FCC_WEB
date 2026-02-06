import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSearchDialog } from './account-search-dialog';

describe('AccountSearchDialog', () => {
  let component: AccountSearchDialog;
  let fixture: ComponentFixture<AccountSearchDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountSearchDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountSearchDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
