import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, formatDate, formatNumber } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

import {
  LinkableTransaction,
  LinkableTransactionSource,
} from '../../core/models/linked-reference';

export interface LinkedReferenceDialogData {
  /** Where the approved transactions come from; none yet means an empty list */
  source?: LinkableTransactionSource;
  /** TNX IDs already linked, shown as linked and not selectable again */
  linkedTnxIds?: string[];
}

export const LINKED_REFERENCE_COLUMNS = [
  'tnxId',
  'createdOn',
  'expiryDate',
  'currency',
  'amount',
  'availableBalance',
  'applicantName',
  'beneficiaryName',
];

/** Formats a date for display; never throws on bad input */
export function displayDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  try {
    // formatDate reads date-only strings ("2026-10-01") as local dates;
    // new Date() would read them as UTC and can show the previous day
    return formatDate(value, 'dd-MMM-yyyy', 'en-US');
  } catch {
    return '—';
  }
}

/** Formats an amount for display; never throws on bad input */
export function displayAmount(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const amount = Number(value);
  return isNaN(amount) ? '—' : formatNumber(amount, 'en-US', '1.2-2');
}

@Component({
  selector: 'app-linked-reference-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './linked-reference-dialog.html',
  styleUrls: ['./linked-reference-dialog.scss'],
})
export class LinkedReferenceDialog implements OnInit {
  readonly displayedColumns = LINKED_REFERENCE_COLUMNS;
  readonly displayDate = displayDate;
  readonly displayAmount = displayAmount;

  transactions: LinkableTransaction[] = [];
  filtered: LinkableTransaction[] = [];
  searchText = '';
  loading = false;
  errorMessage = '';

  private linked = new Set<string>();

  private dialogRef = inject<
    MatDialogRef<LinkedReferenceDialog, LinkableTransaction>
  >(MatDialogRef);
  data = inject<LinkedReferenceDialogData | null>(MAT_DIALOG_DATA, {
    optional: true,
  });

  ngOnInit(): void {
    this.linked = new Set(this.data?.linkedTnxIds ?? []);
    this.load();
  }

  load(): void {
    const source = this.data?.source;
    this.errorMessage = '';

    if (!source) {
      this.setTransactions([]);
      return;
    }

    this.loading = true;
    try {
      source()
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (rows) => this.setTransactions(Array.isArray(rows) ? rows : []),
          error: (err) => {
            console.error('Failed to load linkable transactions:', err);
            this.errorMessage =
              err?.message || 'Unable to load transactions. Please try again.';
            this.setTransactions([]);
          },
        });
    } catch (err) {
      // a source that throws before returning an observable
      console.error('Failed to load linkable transactions:', err);
      this.loading = false;
      this.errorMessage = 'Unable to load transactions. Please try again.';
      this.setTransactions([]);
    }
  }

  applyFilter(): void {
    const term = this.searchText.trim().toLowerCase();
    this.filtered = !term
      ? [...this.transactions]
      : this.transactions.filter((t) =>
          [t.tnxId, t.currency, t.applicantName, t.beneficiaryName].some((v) =>
            String(v ?? '').toLowerCase().includes(term),
          ),
        );
  }

  isLinked(row: LinkableTransaction): boolean {
    return this.linked.has(row.tnxId);
  }

  select(row: LinkableTransaction): void {
    if (!row?.tnxId || this.isLinked(row)) return;
    this.dialogRef.close(row);
  }

  close(): void {
    this.dialogRef.close();
  }

  private setTransactions(rows: LinkableTransaction[]): void {
    // rows without a TNX ID cannot be linked
    this.transactions = rows.filter((r) => !!r?.tnxId);
    this.applyFilter();
  }
}
