import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

import {
  LinkableTransaction,
  LinkableTransactionSource,
} from '../../../../../../core/models/linked-reference';
import {
  displayAmount,
  displayDate,
  LINKED_REFERENCE_COLUMNS,
  LinkedReferenceDialog,
  LinkedReferenceDialogData,
} from '../../../../../../shared/linked-reference-dialog/linked-reference-dialog';

@Component({
  selector: 'app-linked-reference',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatTableModule,
  ],
  templateUrl: './linked-reference.html',
  styleUrls: ['./linked-reference.scss'],
})
export class LinkedReference {
  /** Approved transactions offered in the popup (products are added later) */
  @Input() source?: LinkableTransactionSource;

  /** Hides Link / Remove when the transaction can no longer be edited */
  @Input() readonly = false;

  readonly displayDate = displayDate;
  readonly displayAmount = displayAmount;

  isOpen = true;
  linkedReferences: LinkableTransaction[] = [];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  get displayedColumns(): string[] {
    return this.readonly
      ? LINKED_REFERENCE_COLUMNS
      : [...LINKED_REFERENCE_COLUMNS, 'actions'];
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  openLinkDialog(event?: Event): void {
    event?.stopPropagation();
    if (this.readonly) return;

    const data: LinkedReferenceDialogData = {
      source: this.source,
      linkedTnxIds: this.linkedReferences.map((r) => r.tnxId),
    };

    const dialogRef = this.dialog.open(LinkedReferenceDialog, {
      width: '1100px',
      maxWidth: '95vw',
      data,
    });

    dialogRef.afterClosed().subscribe((selected?: LinkableTransaction) => {
      if (!selected?.tnxId) return;

      if (this.linkedReferences.some((r) => r.tnxId === selected.tnxId)) {
        this.snackBar.open(`${selected.tnxId} is already linked.`, 'Close', {
          duration: 3000,
        });
        return;
      }

      // new array so the table re-renders
      this.linkedReferences = [...this.linkedReferences, selected];
    });
  }

  remove(row: LinkableTransaction): void {
    if (this.readonly) return;
    this.linkedReferences = this.linkedReferences.filter(
      (r) => r.tnxId !== row.tnxId,
    );
  }
}
