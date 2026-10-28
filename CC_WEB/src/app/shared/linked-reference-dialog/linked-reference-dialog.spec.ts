import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { LinkableTransaction } from '../../core/models/linked-reference';
import {
  displayAmount,
  displayDate,
  LinkedReferenceDialog,
  LinkedReferenceDialogData,
} from './linked-reference-dialog';

const ROWS: LinkableTransaction[] = [
  {
    tnxId: 'TNX001',
    createdOn: '2026-10-01',
    expiryDate: '2027-01-31',
    currency: 'USD',
    amount: 1000,
    availableBalance: 400,
    applicantName: 'Alpha Traders',
    beneficiaryName: 'Beta Exports',
  },
  { tnxId: 'TNX002', currency: 'EUR', applicantName: 'Gamma Ltd' },
];

describe('LinkedReferenceDialog', () => {
  let fixture: ComponentFixture<LinkedReferenceDialog>;
  let component: LinkedReferenceDialog;
  let dialogRef: jasmine.SpyObj<MatDialogRef<LinkedReferenceDialog>>;

  function create(data: LinkedReferenceDialogData | null) {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    TestBed.configureTestingModule({
      imports: [LinkedReferenceDialog],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });
    fixture = TestBed.createComponent(LinkedReferenceDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('shows an empty state when no source is provided', () => {
    create(null);
    expect(component.transactions).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain(
      'No approved transactions available to link.',
    );
  });

  it('lists transactions from the source and returns the clicked one', () => {
    create({ source: () => of(ROWS) });
    const links = fixture.nativeElement.querySelectorAll('a.tnx-link');
    expect(links.length).toBe(2);

    links[0].click();
    expect(dialogRef.close).toHaveBeenCalledWith(ROWS[0]);
  });

  it('marks already linked rows and does not return them', () => {
    create({ source: () => of(ROWS), linkedTnxIds: ['TNX001'] });
    expect(fixture.nativeElement.querySelectorAll('a.tnx-link').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Linked');

    component.select(ROWS[0]);
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('filters by search text', () => {
    create({ source: () => of(ROWS) });
    component.searchText = 'gamma';
    component.applyFilter();
    expect(component.filtered.map((r) => r.tnxId)).toEqual(['TNX002']);
  });

  it('shows the error message when the source fails', () => {
    create({ source: () => throwError(() => new Error('Server down')) });
    fixture.detectChanges();
    expect(component.loading).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('Server down');
  });

  it('handles a source that throws instead of returning an observable', () => {
    create({
      source: () => {
        throw new Error('boom');
      },
    });
    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toContain('Unable to load transactions');
  });

  it('ignores rows without a TNX ID', () => {
    create({ source: () => of([{ currency: 'USD' } as LinkableTransaction, ROWS[0]]) });
    expect(component.transactions.map((r) => r.tnxId)).toEqual(['TNX001']);
  });
});

describe('linked reference formatters', () => {
  it('formats valid values and falls back to a dash', () => {
    expect(displayDate('2026-10-01')).toBe('01-Oct-2026');
    expect(displayDate('not a date')).toBe('—');
    expect(displayDate(undefined)).toBe('—');
    expect(displayAmount(1234.5)).toBe('1,234.50');
    expect(displayAmount('abc')).toBe('—');
    expect(displayAmount(null)).toBe('—');
  });
});
