// import { Component, Input } from '@angular/core';
// import {
//   FormArray,
//   FormBuilder,
//   FormGroup,
//   ReactiveFormsModule,
// } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { MatIconModule } from '@angular/material/icon';
// import { SharedService } from '../../../../../../../../../core/services/user-service/shared-form-service/shared-service';
// import { Router } from '@angular/router';
// import { RouterModule } from '@angular/router';

// @Component({
//   selector: 'app-preview',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, MatIconModule, RouterModule],
//   templateUrl: './preview.html',
//   styleUrls: ['./preview.scss'],
// })
// export class PreviewSection {
//   @Input() form!: FormGroup;
//   isOpen = true;
//   currentStep: any;

//   constructor(
//     private dataService: SharedService,
//     private fb: FormBuilder,
//     private router: Router,
//   ) {}

//   ngOnInit() {
//     const data = this.dataService.getFormData();

//     if (data) {
//       this.form = this.fb.group({
//         generaldetails: this.fb.group(data.generaldetails || {}),
//         DrawerDraweeDetails: this.fb.group(data.DrawerDraweeDetails || {}),
//         bankdetails: this.fb.group(data.bankdetails || {}),
//         paymentamount: this.fb.group(data.paymentamount || {}),
//         shippingdetails: this.fb.group(data.shippingdetails || {}),
//         collectioninstructions: this.fb.group(
//           data.collectioninstructions || {},
//         ),
//         license: this.fb.group({
//           attachments: this.fb.array(data.attachments?.attachments || []),
//         }),
//         attachments: this.fb.group({
//           attachments: this.fb.array(data.attachments?.attachments || []),
//           documents: this.fb.array(data.attachments?.documents || []),
//         }),
//       });
//     }
//   }

//   // Toggle Collapse
//   toggle() {
//     this.isOpen = !this.isOpen;
//   }

//   // ✅ Correct Attachments Getter
//   get attachmentsArray(): FormArray {
//     return (
//       (this.form.get('attachments.attachments') as FormArray) ||
//       new FormArray([])
//     );
//   }

//   // ✅ Correct Documents Getter
//   get documentsArray(): FormArray {
//     return (
//       (this.form.get('attachments.documents') as FormArray) || new FormArray([])
//     );
//   }

//   // Back Button
//   previous() {
//     this.router.navigate(['export-collection']);
//   }

//   // Submit Button
//   submit() {
//     console.log('Submitted Data:', this.form.value);

//     // Navigate to success page
//     //  this.router.navigate(['/preview/app-success']);
//   }

//   // File Download
//   downloadFile(file: any) {
//     if (!file || !file.file) return;

//     const url = URL.createObjectURL(file.file);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = file.fileName;
//     a.click();
//     URL.revokeObjectURL(url);
//   }

//   // Helper: Format Labels
//   formatLabel(field: string): string {
//     return field
//       .replace(/([A-Z])/g, ' $1')
//       .replace(/^./, (str) => str.toUpperCase());
//   }

//   // Helper: Format Values
//   formatValue(value: any): string {
//     if (value === true) return 'Yes';
//     if (value === false) return 'No';
//     return value ?? '—';
//   }
// }
import { Component, Input } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SharedService } from '../../../../../../../../../core/services/user-service/shared-form-service/shared-service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { DynamicFields } from '../../../../../../../../../core/services/admin-service/dynamic-fields/dynamic-fields';
import { ExportCollectionFormTransactionService } from '../../../../../../../../../core/services/user-service/export-collection-form-transaction-service/export-collection-form-transaction';
import { MatCard } from '@angular/material/card';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    RouterModule,
    MatCard,
  ],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
})
export class PreviewSection {
  @Input() form!: FormGroup;
  isOpen = true;
  currentStep: any;

  permissionNames: string[] = [];

  constructor(
    private dataService: SharedService,
    private fb: FormBuilder,
    private router: Router,
    private transactionService: ExportCollectionFormTransactionService,
  ) {}

  ngOnInit() {
    const data = this.dataService.getFormData();
    const tx: any = this.transactionService.getCurrentTransaction();
    console.log('preview data loaded ', tx);
    if (!data && tx) {
      // Opened from the amend inquiry list: the transaction is held in
      // ExportCollectionFormTransactionService, not SharedService.
      this.form = this.fb.group({
        generaldetails: this.fb.group({
          collectionType: [tx.collectionType],
          customerReference: [tx.customerReference],
          draweeReference: [tx.draweeReference],
        }),
        DrawerDraweeDetails: this.fb.group({
          drawerName: [tx.drawerName],
          drawerAddress1: [tx.drawerAddress1],
          drawerAddress2: [tx.drawerAddress2],
          draweeName: [tx.draweeName],
          draweeAddress1: [tx.draweeAddress1],
          draweeAddress2: [tx.draweeAddress2],
        }),
        bankdetails: this.fb.group({
          remittingBankName: [tx.remittingBankName],
          issuerReference: [tx.issuerReference],
          principalAccount: [tx.principalAccount],
          feeAccount: [tx.feeAccount],
        }),
        paymentamount: this.fb.group({
          amount: [tx.amount],
          currency: [tx.currency],
          paymentType: [tx.paymentType],
          tenor: [tx.tenor],
        }),
        shippingdetails: this.fb.group({
          shippingMethod: [tx.shippingMethod],
          shipmentReference: [tx.shipmentReference],
          shippingFrom: [tx.shippingFrom],
          shippingTo: [tx.shippingTo],
          shipmentDate: [tx.shipmentDate],
          incoterms: [tx.incoterms],
        }),
        collectioninstructions: this.fb.group({
          advicePaymentBy: [tx.advicePaymentBy],
          adviceAcceptanceDate: [tx.adviceAcceptanceAndDueDateBy],
          openingCharges: [tx.openingCharges],
          outsideCountryCharges: [tx.outsideCountryCharges],
          waiveCharges: [tx.waiveAllChargesIfRefusedByDrawee],
          protestNonPayment: [tx.protestInCaseOfNonPayment],
          protestNonAcceptance: [tx.protestInCaseOfNonAcceptance],
          adviceReasonRefusal: [tx.adviceReasonOfRefusalBy],
          acceptanceDeferred: [tx.acceptanceMayBeDeferredPendingArrival],
          warehouseInsurance: [tx.warehouseOrInsureGoodsIfNecessary],
          referTo: [tx.referTo],
        }),
        license: this.fb.group({ attachments: this.fb.array([]) }),
        attachments: this.fb.group({
          attachments: this.fb.array([]),
          documents: this.fb.array([]),
        }),
      });
    }

    if (data) {
      this.form = this.fb.group({
        generaldetails: this.fb.group(data.generaldetails || {}),
        DrawerDraweeDetails: this.fb.group(data.DrawerDraweeDetails || {}),
        bankdetails: this.fb.group(data.bankdetails || {}),
        paymentamount: this.fb.group(data.paymentamount || {}),
        shippingdetails: this.fb.group(data.shippingdetails || {}),
        collectioninstructions: this.fb.group(
          data.collectioninstructions || {},
        ),
        license: this.fb.group({
          attachments: this.fb.array(data.attachments?.attachments || []),
        }),
        attachments: this.fb.group({
          attachments: this.fb.array(data.attachments?.attachments || []),
          documents: this.fb.array(data.attachments?.documents || []),
        }),

        dynamicFields: this.fb.array(
          (Array.isArray(data?.dynamicFields) ? data.dynamicFields : []).map(
            (field: any) => this.fb.control(field),
          ),
        ),
      });
    }

    const sessionData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    this.permissionNames = sessionData.permissionNames || [];
  }

  trackByIndex(index: number): number {
    return index;
  }
  hasPermission(permission: string): boolean {
    return this.permissionNames.some(
      (p) => p.trim().toLowerCase() === permission.toLowerCase(),
    );
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  get attachmentsArray(): FormArray {
    return (
      (this.form.get('attachments.attachments') as FormArray) ||
      new FormArray([])
    );
  }

  get dynamicFieldsArray(): FormArray {
    return this.form.get('dynamicFields') as FormArray;
  }
  get documentsArray(): FormArray {
    return (
      (this.form.get('attachments.documents') as FormArray) || new FormArray([])
    );
  }

  previous() {
    this.router.navigate([
      '/dashboard/Trade-Services/export-collection/approved-inquiry-records',
    ]);
  }

  submit() {
    if (!this.hasPermission('EC_AmendPreviewSubmit')) {
      return;
    }

    console.log('Submitted Data:', this.form.value);
  }

  downloadFile(file: any) {
    if (!this.hasPermission('EC_AmendPreviewDownload')) {
      return;
    }

    if (!file || !file.file) return;

    const url = URL.createObjectURL(file.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  formatLabel(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  }

  formatValue(value: any): string {
    if (value === true) return 'Yes';
    if (value === false) return 'No';
    return value ?? '—';
  }
}
