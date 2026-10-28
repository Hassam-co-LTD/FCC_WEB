import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { LinkableTransaction } from '../../../../../../core/models/linked-reference';
import { LinkedReference } from './linked-reference';

const ROW: LinkableTransaction = {
  tnxId: 'TNX001',
  createdOn: '2026-10-01',
  expiryDate: '2027-01-31',
  currency: 'USD',
  amount: 1000,
  availableBalance: 400,
  applicantName: 'Alpha Traders',
  beneficiaryName: 'Beta Exports',
};

describe('LinkedReference', () => {
  let fixture: ComponentFixture<LinkedReference>;
  let component: LinkedReference;
  let dialog: jasmine.SpyObj<MatDialog>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  /** Makes the next opened popup close with `result` */
  function popupReturns(result?: LinkableTransaction) {
    dialog.open.and.returnValue({ afterClosed: () => of(result) } as any);
  }

  beforeEach(() => {
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({ imports: [LinkedReference] });
    // the component imports MatDialogModule, so override at component level
    TestBed.overrideComponent(LinkedReference, {
      add: {
        providers: [
          { provide: MatDialog, useValue: dialog },
          { provide: MatSnackBar, useValue: snackBar },
        ],
      },
    });

    fixture = TestBed.createComponent(LinkedReference);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows the Link button and an empty grid message', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Link');
    expect(text).toContain('No references linked yet.');
  });

  it('adds the transaction picked in the popup to the grid', () => {
    popupReturns(ROW);
    component.openLinkDialog();
    fixture.detectChanges();

    expect(component.linkedReferences).toEqual([ROW]);
    const cells = fixture.nativeElement.querySelectorAll('td');
    const text = Array.from(cells).map((c: any) => c.textContent.trim());
    expect(text).toContain('TNX001');
    expect(text).toContain('01-Oct-2026');
    expect(text).toContain('400.00');
    expect(text).toContain('Beta Exports');
  });

  it('passes already linked TNX IDs to the popup', () => {
    component.linkedReferences = [ROW];
    popupReturns(undefined);
    component.openLinkDialog();

    const config = dialog.open.calls.mostRecent().args[1] as any;
    expect(config.data.linkedTnxIds).toEqual(['TNX001']);
  });

  it('does not add the same TNX ID twice', () => {
    component.linkedReferences = [ROW];
    popupReturns({ ...ROW });
    component.openLinkDialog();

    expect(component.linkedReferences.length).toBe(1);
    expect(snackBar.open).toHaveBeenCalled();
  });

  it('does nothing when the popup is cancelled', () => {
    popupReturns(undefined);
    component.openLinkDialog();
    expect(component.linkedReferences).toEqual([]);
  });

  it('removes a linked reference', () => {
    component.linkedReferences = [ROW];
    component.remove(ROW);
    expect(component.linkedReferences).toEqual([]);
  });

  it('hides Link and Remove in read-only mode', () => {
    component.linkedReferences = [ROW];
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.toolbar')).toBeNull();
    expect(component.displayedColumns).not.toContain('actions');

    component.openLinkDialog();
    component.remove(ROW);
    expect(dialog.open).not.toHaveBeenCalled();
    expect(component.linkedReferences.length).toBe(1);
  });
});
