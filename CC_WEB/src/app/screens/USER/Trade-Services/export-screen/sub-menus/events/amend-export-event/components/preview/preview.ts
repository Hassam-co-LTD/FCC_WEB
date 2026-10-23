import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { ImportLcTransaction } from '../../../../../../../../../core/models/import-lc';
import { Router } from '@angular/router';
import { MatCard } from '@angular/material/card';
import { HttpClientModule } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../../../../../../../core/services/api.service';
import { ImportlcFormTransactionService } from '../../../../../../../../../core/services/user-service/importlc-form-transaction-service/importlc-form-transaction-service';
import { RejectDialogComponent } from '../../../../../../../../../shared/reject-dialog/reject-dialog';
import { readSessionJson } from '../../../../../../../../../core/utils/browser-storage';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
  imports: [
    CommonModule,
    MatIcon,
    DecimalPipe,
    MatCard,
    HttpClientModule,
    MatDialogModule,
  ],
  standalone: true,
})
export class Preview {
  @Input() transaction!: ImportLcTransaction;

  viewMode: 'submit' | 'readonly' = 'submit';
  importForm!: FormGroup;

  isOpen = true;
  viewerOpen = false;
  viewerContent: SafeResourceUrl | null = null;
  isImage = false;
  isPdf = false;

  currentTx: ImportLcTransaction | null = null;

  // pageName1 = 'Update';
  // pageName2 = 'Submit';
  permissionNames: string[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private api: ApiService,
    private dialog: MatDialog,
    private transactionService: ImportlcFormTransactionService,
  ) {}
  ngOnInit(): void {
    this.currentTx =
      this.transaction || //  Priority: @Input() transaction (Success page)
      this.transactionService.getCurrentTransaction(); //  Fallback: service (Preview before submit)

    const sessionData = readSessionJson<any>('userData', {});

    this.permissionNames = sessionData.permissionNames || [];

    if (!this.currentTx) {
      console.error('Preview: No transaction data found');
      this.router.navigate(['/dashboard/Trade-Services/export-screen/amend']);
      return;
    }

    this.viewMode = this.transactionService.getViewMode();
    this.initForm();
  }

  hasPermission(permission: string): boolean {
    return this.permissionNames.some(
      (p) => p.trim().toLowerCase() === permission.toLowerCase(),
    );
  }

  private initForm(): void {
    this.importForm = this.fb.group({
      id: [this.currentTx!.id],
      tnxId: [this.currentTx!.tnxId],
      status: [this.currentTx!.status],
      createdOn: [this.currentTx!.createdOn],

      customerReference: [(this.currentTx as any).customerReference],
      advisingBankName: [this.currentTx!.advisingBankName],
      issuerReference: [this.currentTx!.issuerReference],
      uploadFileName: [(this.currentTx as any).uploadFileName],
      attachments: this.fb.array(this.currentTx!.attachments ?? []),
    });

    if (this.viewMode === 'readonly') {
      this.importForm.disable({ emitEvent: false });
    }
  }

  get attachmentsArray(): FormArray {
    return this.importForm.get('attachments') as FormArray;
  }

  back() {
    this.router.navigate([
      '/dashboard/Trade-Services/export-screen/approved-inquiry-records',
    ]);
  }

  submitLc(): void {

        if (!this.hasPermission('ILC_AmendSubmit')) return;

    if (this.viewMode === 'readonly') return;

    const tnxId = this.currentTx?.tnxId;

    if (!tnxId) {
      this.snackBar.open('Transaction ID missing', 'Close', {
        duration: 3000
      });
      return;
    }

    this.api.submitAmendment(tnxId, this.currentTx!).subscribe({
      next: (res) => {
        this.router.navigate(
          ['/dashboard/Trade-Services/export-screen/success'],
          {
            state: { transaction: res },
          },
        );
      },
      error: () => {
        this.snackBar.open('Error submitting transaction', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  approveTransaction(): void {

        if (!this.hasPermission('ILC_AmendApprove')) return;

    if (!this.currentTx?.tnxId) return;

    this.api.approveAmendment(
      this.currentTx.tnxId,
      this.currentTx
    ).subscribe({
      next: (res) => {
        this.snackBar.open('Transaction approved', 'Close', { duration: 3000 });
        this.router.navigate(
          ['/dashboard/Trade-Services/export-screen/success'],
          { state: { transaction: res } },
        );
      },
      error: () =>
        this.snackBar.open('Error approving transaction', 'Close', {
          duration: 3000,
        }),
    });
  }

  rejectTransaction(): void {

     if (!this.hasPermission('ILC_AmendReject')) return;
    const tnxId = this.currentTx?.tnxId;
    if (!tnxId) return;

    const dialogRef = this.dialog.open(RejectDialogComponent, {
      width: '400px',
      hasBackdrop: true, // ensure overlay backdrop
      backdropClass: 'cdk-overlay-dark-backdrop', // dark semi-transparent backdrop
      panelClass: 'custom-dialog-container', // white dialog box
    });

    dialogRef.afterClosed().subscribe((reason: string | undefined) => {
      if (!reason) return; // user cancelled
      this.api.rejectAmendment(tnxId, reason).subscribe({
        next: (res) => {
          this.snackBar.open('Transaction rejected successfully', 'Close', {
            duration: 3000,
          });
          this.router.navigate(
            ['/dashboard/Trade-Services/export-screen/success'],
            { state: { transaction: res } },
          );
        },
        error: () =>
          this.snackBar.open('Error rejecting transaction', 'Close', {
            duration: 3000,
          }),
      });
    });
  }

  downloadFile(index: number) {

    if (!this.hasPermission('ILCAmendPreview')) {
      return;
    }

    const data = this.attachmentsArray.at(index)?.value;

    if (!data) return;

    const { file, fileName } = data;

    if (file instanceof Blob) {
      const url = URL.createObjectURL(file);
      this.triggerDownload(url, fileName);
      URL.revokeObjectURL(url);
      return;
    }

    if (
      typeof file === 'string' &&
      file.startsWith('data:')
    ) {
      const arr = file.split(',');
      const mime =
        arr[0].match(/:(.*?);/)?.[1] ?? '';

      const bstr = atob(arr[1]);
      const u8arr = new Uint8Array(bstr.length);

      for (let n = 0; n < bstr.length; n++) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      const blob = new Blob([u8arr], {
        type: mime
      });

      const url = URL.createObjectURL(blob);
      this.triggerDownload(url, fileName);
      URL.revokeObjectURL(url);
      return;
    }

    console.error('Unsupported file format', file);
  }

  private triggerDownload(
    url: string,
    fileName: string
  ): void {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  }

  trackByIndex(
    index: number,
    item: any
  ): any {
    return item?.id || index;
  }
}