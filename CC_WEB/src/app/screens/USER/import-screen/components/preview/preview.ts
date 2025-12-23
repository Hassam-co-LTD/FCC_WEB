import { Component, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { SharedService } from '../../../../../core/services/user-service/shared-form-service/shared-service';
import { Router } from '@angular/router';
import { MatCard } from "@angular/material/card";
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../../../../core/services/api.service';
import { ImportlcFormTransactionService, ImportLcTransaction } from '../../../../../core/services/user-service/importlc-form-transaction-service/importlc-form-transaction-service';


@Component({
  selector: 'app-preview',
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
  imports: [CommonModule, MatIcon, DecimalPipe, MatCard, HttpClientModule],
  standalone: true,
})
export class Preview implements OnInit {
  @Input() transaction?: ImportLcTransaction;
  @Input() readonly = false;
  @Input() hideActions = false;

  form!: FormGroup;

  isOpen = true;
  viewerOpen = false;
  viewerContent: SafeResourceUrl | null = null;
  isImage = false;
  isPdf = false;
  isPending = false;

  data!: ImportLcTransaction;

  pageName1 = 'Update';
  pageName2 = 'Submit';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private importLcService: ApiService,
    private transactionService: ImportlcFormTransactionService
  ) { }

  ngOnInit(): void {
    const navState = this.router.getCurrentNavigation()?.extras?.state;

    /** 1️⃣ Resolve transaction (correct priority) */
    this.data =
      this.transaction ||
      this.transactionService.getCurrentTransaction() ||
      navState?.['data'];

    if (!this.data) {
      console.error('No transaction data found');
      this.router.navigate(['/import-screen']);
      return;
    }

    /** 2️⃣ Mode flags */
    this.isPending = navState?.['isPending'] ?? !this.readonly;
    this.pageName1 = navState?.['pageName1'] || 'Update';
    this.pageName2 = navState?.['pageName2'] || 'Submit';

    /** 3️⃣ Build form */
    this.form = this.fb.group({
      generalDetails: this.fb.group(this.data.generalDetails || {}),
      applicantForm: this.fb.group(this.data.applicantForm || {}),
      bankForm: this.fb.group(this.data.bankForm || {}),
      amountChargeForm: this.fb.group(this.data.amountChargeForm || {}),
      paymentDetailsForm: this.fb.group(this.data.paymentDetailsForm || {}),
      shipmentForm: this.fb.group(this.data.shipmentForm || {}),
      narrativeForm: this.fb.group(this.data.narrativeForm || {}),
      instructionForm: this.fb.group(this.data.instructionForm || {}),
      attachments: this.fb.array(this.data.attachments || []),
    });

    /** 🔒 Read-only mode (Success page) */
    if (this.readonly) {
      this.form.disable();
    }
  }

  get attachmentsArray(): FormArray {
    return this.form.get('attachments') as FormArray;
  }

  /** UPDATE DRAFT */
  updateDraft(): void {
    this.transactionService.setCurrentTransaction(this.data);
    this.router.navigate(['/import-screen'], {
      state: { isUpdate: true }
    });
  }

  /** SUBMIT */
  submit(): void {
    const payload = {
      ...this.form.get('generalDetails')?.value,
      ...this.form.get('applicantForm')?.value,
      ...this.form.get('bankForm')?.value,
      ...this.form.get('amountChargeForm')?.value,
      ...this.form.get('paymentDetailsForm')?.value,
      ...this.form.get('shipmentForm')?.value,
      ...this.form.get('narrativeForm')?.value,
      ...this.form.get('instructionForm')?.value,
      attachments: this.attachmentsArray.value || [],
    };

    this.importLcService.submitPreview(payload).subscribe({
      next: () => {
        this.transactionService.addSubmitted(this.data.tnxId);

        this.snackBar.open(
          `Data successfully submitted! (TNX ID: ${this.data.tnxId})`,
          'Close',
          { duration: 3000, horizontalPosition: 'right', verticalPosition: 'top' }
        );

        this.router.navigate(['/import-screen/success'], {
          state: { transaction: this.data }
        });
      },
      error: () => {
        this.snackBar.open('Error submitting data', 'Close', {
          duration: 3000
        });
      }
    });
  }
  downloadFile(index: number) {
      const data = this.attachmentsArray.at(index)?.value;
      if (!data) return;

      const { file, fileName } = data;

      if (file instanceof Blob) {
        const url = URL.createObjectURL(file);
        this.triggerDownload(url, fileName);
        URL.revokeObjectURL(url);
        return;
      }

      if (typeof file === 'string' && file.startsWith('data:')) {
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

// export class Preview implements OnInit {
//   @Input() transaction!: ImportLcTransaction;
//   @Input() readonly = false;
//   @Input() hideActions = false;

//   form!: FormGroup;

//   isOpen = true;
//   viewerOpen = false;
//   viewerContent: SafeResourceUrl | null = null;
//   isImage = false;
//   isPdf = false;
//   isPending = false;          // To show Update / Submit buttons
  
//   data!: ImportLcTransaction;  // Full transaction object

//   pageName1 = 'Update';
//   pageName2 = 'Submit';

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private snackBar: MatSnackBar,
//     private importLcService: ApiService,
//     private transactionService: ImportlcFormTransactionService
//   ) { }

//   ngOnInit() {
//     const navState = this.router.getCurrentNavigation()?.extras?.state;

//     // Get transaction from service
//     this.data = this.transactionService.getCurrentTransaction()!;

//     if (!this.data) {
//       console.error('No transaction data found');
//       this.router.navigate(['/import-screen']); // redirect to listing
//       return;
//     }

//     this.isPending = navState?.['isPending'] ?? true;
//     this.pageName1 = navState?.['pageName1'] || 'Update';
//     this.pageName2 = navState?.['pageName2'] || 'Submit';

//     // Initialize form with transaction data
//     this.form = this.fb.group({
//       generalDetails: this.fb.group(this.data.generalDetails || {}),
//       applicantForm: this.fb.group(this.data.applicantForm || {}),
//       bankForm: this.fb.group(this.data.bankForm || {}),
//       amountChargeForm: this.fb.group(this.data.amountChargeForm || {}),
//       paymentDetailsForm: this.fb.group(this.data.paymentDetailsForm || {}),
//       shipmentForm: this.fb.group(this.data.shipmentForm || {}),
//       narrativeForm: this.fb.group(this.data.narrativeForm || {}),
//       instructionForm: this.fb.group(this.data.instructionForm || {}),
//       attachments: this.fb.array(this.data.attachments || []),
//     });
//   }



//   toggle() {
//     this.isOpen = !this.isOpen;
//   }

//   trackByIndex(index: number, item: any): any {
//     return item?.id || index;
//   }

//   get attachmentsArray(): FormArray {
//     return (this.form.get('attachments') as FormArray)
//   }

//   // previous() {
//   //   this.router.navigate(['import-screen'])
//   // }


//   // submit() {
//   //   console.log("Submitted Data:", this.form.value);

//   //   // Show success toast
//   //   this.snackBar.open('Data successfully submitted!', 'Close', {
//   //     duration: 3000, // 3 seconds
//   //     horizontalPosition: 'right',
//   //     verticalPosition: 'top',
//   //     panelClass: ['success-snackbar']
//   //   });
//   //   console.log("Submitted Data:", this.form.value);
//   // }

//   // Update draft: navigate to form page prefilled
//   updateDraft() {
//     // this.transactionService.setCurrentTransaction(this.data);
//     // this.router.navigate(['/import-screen'], { state: { data: this.data } });
//     this.router.navigate(['/import-screen']);
//   }
//   submit() {
//     // Prepare payload dynamically
//     const payload = {
//       ...this.form.get('generalDetails')?.value,
//       ...this.form.get('applicantForm')?.value,
//       ...this.form.get('bankForm')?.value,
//       ...this.form.get('amountChargeForm')?.value,
//       ...this.form.get('paymentDetailsForm')?.value,
//       ...this.form.get('shipmentForm')?.value,
//       ...this.form.get('narrativeForm')?.value,
//       ...this.form.get('instructionForm')?.value,
//       attachments: this.attachmentsArray?.value || [],
//     };
//     this.importLcService.submitPreview(payload).subscribe({
//       next: (res) => {
//         // Add the transaction to submitted list
//         this.transactionService.addSubmitted(this.data.tnxId);

//         this.snackBar.open(`Data successfully submitted! (TNX ID: ${this.data.tnxId})`, 'Close', {
//           duration: 3000,
//           horizontalPosition: 'right',
//           verticalPosition: 'top',
//           panelClass: ['success-snackbar']
//         });
//         this.router.navigate(['/import-screen/success'], { state: { data: this.data } });
//         this.transactionService.clearCurrentTransaction();
//       },
//       error: (err) => {
//         console.error("Submit Error:", err);
//         this.snackBar.open('Error submitting data', 'Close', {
//           duration: 3000,
//           horizontalPosition: 'right',
//           verticalPosition: 'top'
//         });
//       }
//     });
//   }


//   downloadFile(index: number) {
//     const data = this.attachmentsArray.at(index)?.value;
//     if (!data) return;

//     const { file, fileName } = data;

//     if (file instanceof Blob) {
//       const url = URL.createObjectURL(file);
//       this.triggerDownload(url, fileName);
//       URL.revokeObjectURL(url);
//       return;
//     }

//     if (typeof file === 'string' && file.startsWith('data:')) {
//       const arr = file.split(',');
//       const mime = arr[0].match(/:(.*?);/)?.[1] ?? '';
//       const bstr = atob(arr[1]);
//       const u8arr = new Uint8Array(bstr.length);
//       for (let n = 0; n < bstr.length; n++) {
//         u8arr[n] = bstr.charCodeAt(n);
//       }
//       const blob = new Blob([u8arr], { type: mime });
//       const url = URL.createObjectURL(blob);
//       this.triggerDownload(url, fileName);
//       URL.revokeObjectURL(url);
//       return;
//     }

//     console.error("Unsupported file format", file);
//   }

//   private triggerDownload(url: string, fileName: string) {
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = fileName;
//     a.click();
//   }
// }