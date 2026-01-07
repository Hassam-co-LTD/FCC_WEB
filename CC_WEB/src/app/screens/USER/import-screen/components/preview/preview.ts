import { Component, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatCard } from "@angular/material/card";
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../../../../core/services/api.service';
import { ImportlcFormTransactionService } from '../../../../../core/services/user-service/importlc-form-transaction-service/importlc-form-transaction-service';
import { ImportLcTransaction } from "../../../../../core/models/import-lc";

@Component({
  selector: 'app-preview',
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
  imports: [CommonModule, MatIcon, DecimalPipe, MatCard, HttpClientModule],
  standalone: true,
})
export class Preview implements OnInit {
  @Input() transaction!: ImportLcTransaction;
  // @Input() readonly = false;

  // get showActions(): boolean {
  //   return this.transaction?.status === 'I';
  // }
  importForm!: FormGroup;

  isOpen = true;
  viewerOpen = false;
  viewerContent: SafeResourceUrl | null = null;
  isImage = false;
  isPdf = false;

  currentTx: ImportLcTransaction | null = null;
  readOnly = false;

  // pageName1 = 'Update';
  // pageName2 = 'Submit';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private api: ApiService,
    private transactionService: ImportlcFormTransactionService
  ) { }

  ngOnInit(): void {
    // 1️⃣ Priority: @Input() transaction (Success page)
    if (this.transaction) {
      this.currentTx = this.transaction;
    }
    // 2️⃣ Fallback: service (Preview before submit)
    else {
      this.currentTx = this.transactionService.getCurrentTransaction();
    }

    if (!this.currentTx) {
      console.error('Preview: No transaction data found');
      this.router.navigate(['/import-screen']);
      return;
    }

    this.importForm = this.fb.group({
      id: [this.currentTx.id],
      tnxId: [this.currentTx.tnxId],
      status: [this.currentTx.status],
      createdOn: [this.currentTx.createdOn],

      productType: [this.currentTx.productType],
      modeOfTransmission: [this.currentTx.modeOfTransmission], 
      expiryDate: [this.currentTx.expiryDate],
      placeOfExpiry: [this.currentTx.placeOfExpiry],

      applicantName: [this.currentTx.applicantName],
      applicantAddress1: [this.currentTx.applicantAddress1],
      applicantAddress2: [this.currentTx.applicantAddress2],
      applicantAddress3: [this.currentTx.applicantAddress3],

      beneficiaryName: [this.currentTx.beneficiaryName],
      beneficiaryAddress1: [this.currentTx.beneficiaryAddress1],
      beneficiaryAddress2: [this.currentTx.beneficiaryAddress2],
      beneficiaryAddress3: [this.currentTx.beneficiaryAddress3],
      beneficiaryCountry: [this.currentTx.beneficiaryCountry],

      issuingBankName: [this.currentTx.issuingBankName],
      issuerReference: [this.currentTx.issuerReference],
      advisingBankName: [this.currentTx.advisingBankName],
      adviseThroughBankName: [this.currentTx.adviseThroughBankName],

      currency: [this.currentTx.currency],
      amount: [this.currentTx.amount],
      additionalAmount: [this.currentTx.additionalAmount],
      variationType: [this.currentTx.variationType],
      variationPlus: [this.currentTx.variationPlus],
      variationMinus: [this.currentTx.variationMinus],

      creditAvailableWith: [this.currentTx.creditAvailableWith],
      bankName: [this.currentTx.bankName],
      creditAvailableBy: [this.currentTx.creditAvailableBy],
      paymentDraftAt: [this.currentTx.paymentDraftAt],

      shipmentFrom: [this.currentTx.shipmentFrom],
      shipmentTo: [this.currentTx.shipmentTo],
      placeOfLoading: [this.currentTx.placeOfLoading],
      placeOfDischarge: [this.currentTx.placeOfDischarge],
      lastShipmentDate: [this.currentTx.lastShipmentDate],
      shipmentPeriodNarrative: [this.currentTx.shipmentPeriodNarrative],
      partialShipment: [this.currentTx.partialShipment],
      transhipment: [this.currentTx.transhipment],

      descriptionOfGoods: [this.currentTx.descriptionOfGoods],
      documentsRequired: [this.currentTx.documentsRequired],
      additionalInstructions: [this.currentTx.additionalInstructions],
      otherInstructions: [this.currentTx.otherInstructions],

      principalAccount: [this.currentTx.principalAccount],
      feeAccount: [this.currentTx.feeAccount],

      attachments: this.fb.array(this.currentTx.attachments ?? [])
    });

    // 🔒 Read-only mode (Success page)
    // if (this.readonly) {
    //   this.importForm.disable({ emitEvent: false });
    // }
  }

  get attachmentsArray(): FormArray {
    return this.importForm.get('attachments') as FormArray;
  }


  /** UPDATE DRAFT */
  updateDraft(): void {
    if (this.readOnly) return;

    this.transactionService.setCurrentTransaction(this.currentTx!);
    this.router.navigate(['/import-screen'], { state: { isUpdate: true } });
  }

  back() {
    this.router.navigate(['/import-screen/enquiries'])
  }

  /** SUBMIT */
  submitLc(): void {
    if (this.readOnly) return;

    const tnxId = this.currentTx?.tnxId;
    if (!tnxId) {
      this.snackBar.open('Transaction ID missing', 'Close', { duration: 3000 });
      return;
    }

    this.api.submitTransaction(tnxId, this.currentTx!).subscribe({
      next: (res) => {
        this.router.navigate(['/import-screen/success'], {
          state: { transaction: res }
        });
      },
      error: () => {
        this.snackBar.open('Error submitting transaction', 'Close', { duration: 3000 });
      }
    });
  }

  downloadFile(index: number) {
      const currentTx = this.attachmentsArray.at(index)?.value;
      if (!currentTx) return;

      const { file, fileName } = currentTx;

      if (file instanceof Blob) {
        const url = URL.createObjectURL(file);
        this.triggerDownload(url, fileName);
        URL.revokeObjectURL(url);
        return;
      }

      if (typeof file === 'string' && file.startsWith('currentTx:')) {
        const arr = file.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] ?? '';
        const bstr = atob(arr[1]);
        const u8arr = new Uint8Array(bstr.length);
        for (let n = 0; n < bstr.length; n++) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const url = URL.createObjectURL(blob);
        this.triggerDownload(url, fileName);
        URL.revokeObjectURL(url);
        return;
      }

      console.error("Unsupported file format", file);
    }

    private triggerDownload(url: string, fileName: string) {
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
    }

    trackByIndex(index: number, item: any): any {
      return item?.id || index;
    }
  
}