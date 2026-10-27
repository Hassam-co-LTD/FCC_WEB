import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { ImportCollectionTransaction } from '../../../../../../../../../core/models/import-collection';
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
    MatCard,
    HttpClientModule,
    MatDialogModule,
  ],
  standalone: true,
})
export class Preview {
  @Input() transaction!: ImportCollectionTransaction;

  viewMode: 'submit' | 'readonly' = 'submit';
  importForm!: FormGroup;

  isOpen = true;
  viewerOpen = false;
  viewerContent: SafeResourceUrl | null = null;
  isImage = false;
  isPdf = false;

  currentTx: ImportCollectionTransaction | null = null;

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
      this.router.navigate(['/dashboard/Trade-Services/import-collection/amend']);
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

      documentRelease: [(this.currentTx as any).documentRelease],
      productType: [(this.currentTx as any).productType],
      receivedFromReference: [(this.currentTx as any).receivedFromReference],
      receivedOn: [(this.currentTx as any).receivedOn],
      collectionAmount: [(this.currentTx as any).collectionAmount],
      sharedDirectory: [(this.currentTx as any).sharedDirectory],
      direct: [(this.currentTx as any).direct],
      multiplePayment: [(this.currentTx as any).multiplePayment],
      receivedFrom: [(this.currentTx as any).receivedFrom],
      receivedFromCode: [(this.currentTx as any).receivedFromCode],
      receivedFromName: [(this.currentTx as any).receivedFromName],
      receivedFromCountry: [(this.currentTx as any).receivedFromCountry],
      sendTo: [(this.currentTx as any).sendTo],
      sendToCode: [(this.currentTx as any).sendToCode],
      sendToName: [(this.currentTx as any).sendToName],
      drawerName: [(this.currentTx as any).drawerName],
      drawerCode: [(this.currentTx as any).drawerCode],
      drawerCountry: [(this.currentTx as any).drawerCountry],
      draftCollectionCurrency: [(this.currentTx as any).draftCollectionCurrency],
      draftCollectionAmount: [(this.currentTx as any).draftCollectionAmount],
      draftAgainst: [(this.currentTx as any).draftAgainst],
      draftIdentifier: [(this.currentTx as any).draftIdentifier],
      draftText: [(this.currentTx as any).draftText],
      draftAmount: [(this.currentTx as any).draftAmount],
      tenor: [(this.currentTx as any).tenor],
      interestRate: [(this.currentTx as any).interestRate],
      interestStartDate: [(this.currentTx as any).interestStartDate],
      interestEndPeriod: [(this.currentTx as any).interestEndPeriod],
      startInterest: [(this.currentTx as any).startInterest],
      dayBasis: [(this.currentTx as any).dayBasis],
      startFrom: [(this.currentTx as any).startFrom],
      interestEndDate: [(this.currentTx as any).interestEndDate],
      graceDays: [(this.currentTx as any).graceDays],
      waiveIfRefused: [(this.currentTx as any).waiveIfRefused],
      goodsCode: [(this.currentTx as any).goodsCode],
      goodsDescription: [(this.currentTx as any).goodsDescription],
      shipmentFrom: [(this.currentTx as any).shipmentFrom],
      expectedDate: [(this.currentTx as any).expectedDate],
      shipmentTo: [(this.currentTx as any).shipmentTo],
      vesselAircraft: [(this.currentTx as any).vesselAircraft],
      urcApply: [(this.currentTx as any).urcApply],
      acknowledgeReceipt: [(this.currentTx as any).acknowledgeReceipt],
      adviseNonAcceptance: [(this.currentTx as any).adviseNonAcceptance],
      adviseAcceptance: [(this.currentTx as any).adviseAcceptance],
      advisePayment: [(this.currentTx as any).advisePayment],
      adviseNonPayment: [(this.currentTx as any).adviseNonPayment],
      holdDocumentsUntilArrivalOfGoods: [(this.currentTx as any).holdDocumentsUntilArrivalOfGoods],
      protestNonAcceptance: [(this.currentTx as any).protestNonAcceptance],
      protestNonPayment: [(this.currentTx as any).protestNonPayment],
      allowPartPayments: [(this.currentTx as any).allowPartPayments],
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
      '/dashboard/Trade-Services/import-collection/approved-inquiry-records',
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
          ['/dashboard/Trade-Services/import-collection/success'],
          {
            state: { source: 'IMPORT_COLLECTION', transaction: res },
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
          ['/dashboard/Trade-Services/import-collection/success'],
          { state: { source: 'IMPORT_COLLECTION', transaction: res } },
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
            ['/dashboard/Trade-Services/import-collection/success'],
            { state: { source: 'IMPORT_COLLECTION', transaction: res } },
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