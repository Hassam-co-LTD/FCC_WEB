// import { Component, OnInit } from '@angular/core';
// import {
//   FormArray,
//   FormBuilder,
//   FormGroup,
//   FormsModule,
//   Validators,
// } from '@angular/forms';
// import { ReactiveFormsModule } from '@angular/forms';
// import { Router, RouterOutlet } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { ActivatedRoute } from '@angular/router';
// import { ApiService } from '../../../../../../../core/services/api.service';
// import { Sidebar } from '../../../../../../../core/sidebar/sidebar';
// import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// // CHILD COMPONENTS
// import { GeneralDetails } from './components/general-details/general-details';
// import { DrawerDraweeDetails } from './components/drawer-drawee-details/drawer-drawee-details';
// import { BankDetailsComponent } from './components/bank-details/bank-details';
// import { ShippingDetailsComponent } from './components/shipping-details/shipping-details';
// import { PaymentAmountComponent } from './components/payment-amount/payment-amount';
// import { CollectionInstructionsComponent } from './components/collection-instructions/collection-instructions';
// import { License } from './components/license/license';
// import { AttachmentsDocuments } from './components/attachments-documents/attachments-documents';
// import { RejectDialogComponent } from '../../../../../../../shared/reject-dialog/reject-dialog';
// import { finalize } from 'rxjs';

// import { ExportCollectionTransaction } from '../../../../../../../core/models/export-collection';

// @Component({
//   selector: 'app-amend',
//   standalone: true,
//   imports: [
//     ReactiveFormsModule,
//     GeneralDetails,
//     DrawerDraweeDetails,
//     BankDetailsComponent,
//     PaymentAmountComponent,
//     ShippingDetailsComponent,
//     CollectionInstructionsComponent,
//     License,
//     AttachmentsDocuments,
//     Sidebar,
//     MatDialogModule,
//     CommonModule,
//     FormsModule,
//     RouterOutlet,
//   ],
//   templateUrl: './amend.html',
//   styleUrls: ['./amend.scss'],
// })
// export class Amend implements OnInit {
//   currentStep = 0;
//   ExportCollectionForm!: FormGroup;
//   mode: 'CREATE' | 'UPDATE' | 'REJECTED' = 'CREATE';
//   screenMode: 'EDIT' | 'SUBMITTED' | 'APPROVED' | 'FINAL' = 'EDIT';
//   currentTx: ExportCollectionTransaction = {} as ExportCollectionTransaction;
//   showUpdateSubmit = false;
//   showApproveReject = false;
//   rejectionReason = '';
//   tnxId = '';
//   companyId = '';
//   eventType: string = '';
//   eventRefNo: string = '';
//   requestedMode: string = '';
//   sourceTab: string = '';
//   isSaving = false;
//   isHistoricalView = false;

//   exportCollectionSteps = [
//     { label: 'General Details' },
//     { label: 'Drawer & Drawee Details' },
//     { label: 'Bank Details' },
//     { label: 'Payment & Amount' },
//     { label: 'Shipment Details' },
//     { label: 'Collection Instruction' },
//     { label: 'License' },
//     { label: 'Attachments' },
//   ];

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private snackBar: MatSnackBar,
//     private api: ApiService,
//     private route: ActivatedRoute,
//     private dialog: MatDialog,
//   ) {
//     this.buildForm();
//   }

//   ngOnInit() {
//     setTimeout(() => {
//       const sections = document.querySelectorAll('section');
//       const observer = new IntersectionObserver(
//         (entries) => {
//           entries.forEach((entry) => {
//             if (entry.isIntersecting) {
//               this.currentStep = Array.from(sections).indexOf(
//                 entry.target as HTMLElement,
//               );
//             }
//           });
//         },
//         { threshold: 0.4, root: document.querySelector('.scroll-area') },
//       );
//       sections.forEach((section) => observer.observe(section));
//     }, 200);

//     this.route.queryParamMap.subscribe((params) => {
//       this.requestedMode = params.get('mode')!;
//     });

//     const sessionData = JSON.parse(sessionStorage.getItem('userData') || '{}');
//     this.companyId = sessionData.companyId ?? '';

//     // this.companyId = this.authservice.getCompanyId() || '';
//     console.log('Company ID from route:', this.companyId);
//     this.tnxId = this.route.snapshot.paramMap.get('tnxId') || '';
//     console.log('TNX ID from route:', this.tnxId);

//     this.route.paramMap.subscribe((params) => {
//       this.tnxId = params.get('tnxId') || '';

//       this.route.queryParamMap.subscribe((q) => {
//         this.requestedMode = q.get('mode') ?? '';
//         this.sourceTab = q.get('tab') ?? ''; // read tab
//         this.eventType = q.get('eventType') ?? ''; // read eventType directly
//         this.eventRefNo = q.get('eventRefNo') ?? '';

//         console.log('tnxId:', this.tnxId);
//         console.log('sourceTab:', this.sourceTab);
//         console.log('eventType:', this.eventType);
//         console.log('eventRefNo:', this.eventRefNo);

//         if (this.tnxId) {
//           this.enterEditMode(this.tnxId);
//         } else {
//           this.enterCreateMode();
//         }
//       });
//     });
//   }
//   // const txFromState = history.state.transaction;
//   // console.log('Transaction from state:', txFromState);
//   //   this.route.paramMap.subscribe(params => {
//   //     this.tnxId = params.get('tnxId') || '';

//   //     this.route.queryParamMap.subscribe(q => {
//   //       this.requestedMode = q.get('mode')!;

//   //       if (this.tnxId) {
//   //         this.enterEditMode(this.tnxId);
//   //       } else {
//   //         this.enterCreateMode();
//   //       }
//   //     });
//   //   });
//   // }

//   private buildForm(): void {
//     // Always initialize the form to avoid null bindings
//     this.ExportCollectionForm = this.fb.group({
//       generalDetails: this.fb.group({
//         collectionType: [''],
//         customerReference: [''],
//         draweeReference: [''],
//       }),
//       DrawerDraweeDetails: this.fb.group({
//         drawerName: [''],
//         drawerAddress1: [''],
//         drawerAddress2: [''],
//         drawerAddress3: [''],
//         drawerAddress4: [''],
//         draweeName: [''],
//         beneficiaryName: [''],
//         draweeAddress1: [''],
//         draweeAddress2: [''],
//         draweeAddress3: [''],
//         draweeAddress4: [''],
//       }),
//       bankDetails: this.fb.group({
//         remittingBankName: [''],
//         issuerReference: [''],
//         principalAccount: [''],
//         feeAccount: [''],
//         presentingBankName: [''],
//         bankAddress1: [''],
//         bankAddress2: [''],
//         bankAddress3: [''],
//         bankAddress4: [''],
//         collectingBankName: [''],
//         swiftCode: [''],
//         collectingReference: [''],
//       }),
//       PaymentAndAmount: this.fb.group({
//         currency: [''],
//         amount: ['', Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)],
//         paymentType: [''],
//         tenor: [''],
//         paymentReference: [''],
//       }),
//       ShipmentDetails: this.fb.group({
//         shippingMethod: [''],
//         shipmentReference: [''],
//         shippingFrom: [''],
//         shippingTo: [''],
//         shipmentDate: [''],
//       }),
//       CollectionInstruction: this.fb.group({
//         advicePaymentBy: [''],
//         adviceAcceptanceAndDueDateBy: [''],
//         adviceReasonOfRefusalBy: [''],
//         waiveAllChargesIfRefusedByDrawee: [''],
//         protestInCaseOfNonPayment: [''],
//         protestInCaseOfNonAcceptance: [''],
//         acceptanceMayBeDeferredPendingArrival: ['Allowed'],
//         warehouseOrInsureGoodsIfNecessary: ['Not Allowed'],
//         openingCharges: [''],
//         outsideCountryCharges: [''],
//         referTo: [''],
//       }),

//       attachments: this.fb.array([]),
//     });
//   }

//   private enterCreateMode(): void {
//     this.mode = 'CREATE';
//     this.showUpdateSubmit = false;
//     this.showApproveReject = false;
//     this.isHistoricalView = false;
//     this.currentTx = {} as ExportCollectionTransaction;
//     this.ExportCollectionForm.reset();
//     this.buildForm();
//   }

//   // ======================================================
//   private enterEditMode(tnxId: string): void {
//     this.mode = 'UPDATE';

//     // ── SCENARIO 1 ─────────────────────────────────────────────────────────
//     // eventRefNo present → specific historical event snapshot, always read-only
//     // Triggered from Inquiries Live tab row click
//     // ────────────────────────────────────────────────────────────────────────
//     if (this.eventRefNo) {
//       this.isHistoricalView = true;
//       this.api
//         .getAmendmentByEventRefNoExportCollection(this.eventRefNo)
//         .subscribe({
//           next: (event) => {
//             this.currentTx = event;
//             this.screenMode = 'APPROVED';
//             this.ExportCollectionForm.disable();
//             this.patchForm(event);
//           },
//           error: () => {
//             this.snackBar.open('Event snapshot not found', 'Close', {
//               duration: 3000,
//             });
//             this.router.navigate([
//               'dashboard/Trade-Services/export-collection/inquiries-records',
//             ]);
//           },
//         });
//       return;
//     }

//     // ── SCENARIO 2 ─────────────────────────────────────────────────────────
//     // sourceTab='live', no eventRefNo → user wants to initiate/continue an amendment
//     // Triggered from ApprovedInquiryRecords Live tab row click
//     // Try to load existing AMD draft; if none exists, pre-populate from master LC
//     // ────────────────────────────────────────────────────────────────────────
//     if (this.sourceTab === 'live') {
//       this.isHistoricalView = false;

//       this.api.getAmendmentByTnxIdExportCollection(tnxId).subscribe({
//         next: (event) => {
//           // Existing AMD draft found — load it
//           this.currentTx = event;
//           this.patchForm(event);

//           if (event.status === 'I') {
//             this.screenMode = 'EDIT';
//             this.ExportCollectionForm.enable();
//           } else {
//             // AMD already submitted/approved — shouldn't normally happen from Live tab
//             // but handle defensively: show read-only
//             this.screenMode = 'SUBMITTED';
//             this.ExportCollectionForm.disable();
//           }
//         },
//         error: () => {
//           // No existing AMD draft — load master LC data to pre-populate form
//           // The AMD event will only be created when user clicks Save
//           this.api.getTransactionByTnxIdExportCollection(tnxId).subscribe({
//             next: (tx) => {
//               // Only store tnxId on currentTx — no eventRefNo exists yet
//               this.currentTx = {
//                 tnxId: tx.tnxId,
//               } as ExportCollectionTransaction;
//               this.patchForm(tx);
//               this.screenMode = 'EDIT';
//               this.ExportCollectionForm.enable();
//             },
//             error: () => {
//               this.snackBar.open('Transaction not found', 'Close', {
//                 duration: 3000,
//               });
//               this.router.navigate([
//                 'dashboard/Trade-Services/export-collection/inquiries-records',
//               ]);
//             },
//           });
//         },
//       });
//       return;
//     }

//     // ── SCENARIO 3 ─────────────────────────────────────────────────────────
//     // AMD event tabs (pending/submitted/approved/rejected with eventType=AMD)
//     // Triggered from ApprovedInquiryRecords non-live tabs
//     // ────────────────────────────────────────────────────────────────────────
//     const isAmendmentTab =
//       this.eventType === 'AMD' ||
//       this.sourceTab === 'pending' ||
//       this.sourceTab === 'submitted' ||
//       this.sourceTab === 'approved' ||
//       this.sourceTab === 'rejected';

//     if (isAmendmentTab) {
//       this.isHistoricalView = false;

//       this.api.getAmendmentByTnxIdExportCollection(tnxId).subscribe({
//         next: (event) => {
//           this.currentTx = event;
//           this.patchForm(event);

//           switch (event.status) {
//             case 'I':
//               this.mode = 'UPDATE';
//               this.screenMode = 'EDIT';
//               this.ExportCollectionForm.enable();
//               break;
//             case 'S':
//               this.mode = 'UPDATE';
//               this.screenMode = 'SUBMITTED';
//               this.ExportCollectionForm.disable();
//               break;
//             case 'A':
//               this.mode = 'UPDATE';
//               this.screenMode = 'APPROVED';
//               this.ExportCollectionForm.disable();
//               break;
//             case 'R':
//               this.mode = 'REJECTED';
//               this.screenMode = 'EDIT';
//               this.ExportCollectionForm.enable();
//               break;
//             default:
//               this.mode = 'UPDATE';
//               this.screenMode = 'FINAL';
//               this.ExportCollectionForm.disable();
//           }
//         },
//         error: () => {
//           this.snackBar.open('Amendment not found', 'Close', {
//             duration: 3000,
//           });
//           this.router.navigate([
//             'dashboard/Trade-Services/export-collection/inquiries-records',
//           ]);
//         },
//       });
//       return;
//     }

//     // ── SCENARIO 4 ─────────────────────────────────────────────────────────
//     // Master LC (Enquiries non-live tabs with eventType=CRE or unset)
//     // ────────────────────────────────────────────────────────────────────────
//     this.isHistoricalView = false;
//     this.api.getTransactionByTnxIdExportCollection(tnxId).subscribe({
//       next: (tx) => {
//         this.currentTx = tx;
//         this.patchForm(tx);

//         switch (tx.status) {
//           case 'I':
//             this.mode = 'UPDATE';
//             this.screenMode = 'EDIT';
//             this.ExportCollectionForm.enable();
//             break;
//           case 'S':
//             this.mode = 'UPDATE';
//             this.screenMode = 'SUBMITTED';
//             this.ExportCollectionForm.disable();
//             break;
//           case 'A':
//             this.mode = 'UPDATE';
//             if (this.requestedMode === 'EDIT') {
//               this.screenMode = 'EDIT';
//               this.ExportCollectionForm.enable();
//             } else {
//               this.screenMode = 'APPROVED';
//               this.ExportCollectionForm.disable();
//             }
//             break;
//           case 'R':
//             this.mode = 'REJECTED';
//             this.screenMode = 'EDIT';
//             this.ExportCollectionForm.enable();
//             break;
//           default:
//             this.mode = 'UPDATE';
//             this.screenMode = 'FINAL';
//             this.ExportCollectionForm.disable();
//         }
//       },
//       error: () => {
//         this.snackBar.open('Transaction not found', 'Close', {
//           duration: 3000,
//         });
//         this.router.navigate([
//           'dashboard/Trade-Services/export-collection/inquiries-records',
//         ]);
//       },
//     });
//   }

//   // Safe getters for html form access of the specific form groups
//   get generalDetails(): FormGroup {
//     return this.ExportCollectionForm.get('generalDetails') as FormGroup;
//   }
//   get DrawerDraweeDetails(): FormGroup {
//     return this.ExportCollectionForm.get('DrawerDraweeDetails') as FormGroup;
//   }
//   get bankDetails(): FormGroup {
//     return this.ExportCollectionForm.get('bankDetails') as FormGroup;
//   }
//   get PaymentAndAmount(): FormGroup {
//     return this.ExportCollectionForm.get('PaymentAndAmount') as FormGroup;
//   }
//   get ShipmentDetails(): FormGroup {
//     return this.ExportCollectionForm.get('ShipmentDetails') as FormGroup;
//   }
//   get CollectionInstruction(): FormGroup {
//     return this.ExportCollectionForm.get('CollectionInstruction') as FormGroup;
//   }
//   get attachmentsArray(): FormArray {
//     return this.ExportCollectionForm.get('attachments') as FormArray;
//   }

//   private patchForm(tx: ExportCollectionTransaction): void {
//     this.ExportCollectionForm.patchValue({
//       generalDetails: tx,
//       DrawerDraweeDetails: tx,
//       bankDetails: tx,
//       PaymentAndAmount: tx,
//       ShipmentDetails: tx,
//       CollectionInstruction: tx,
//     });
//   }

//   // scrollToSection(i: number) {
//   //   this.currentStep = i;
//   //   document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
//   // }

//   scrollToSection(index: number) {
//     this.currentStep = index;
//     const section = document.getElementById(`section-${index}`);
//     section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
//   }
//   private flattenForm(): ExportCollectionTransaction {
//     return {
//       companyId: this.companyId,
//       ...this.ExportCollectionForm.value.generalDetails,
//       ...this.ExportCollectionForm.value.DrawerDraweeDetails,
//       ...this.ExportCollectionForm.value.bankDetails,
//       ...this.ExportCollectionForm.value.PaymentAndAmount,
//       ...this.ExportCollectionForm.value.ShipmentDetails,
//       ...this.ExportCollectionForm.value.CollectionInstruction,
//       ...this.ExportCollectionForm.value.instructionForm,
//       attachments: this.ExportCollectionForm.value.attachments,
//     };
//   }

//   saveForm(): void {
//     if (this.isSaving) return;
//     this.isSaving = true;

//     if (!this.companyId) {
//       this.snackBar.open('Session expired or company not found.', 'Close', {
//         duration: 3000,
//       });
//       this.isSaving = false;
//       return;
//     }

//     const payload = this.flattenForm();
//     console.log('Payload before saving draft:', payload);
//     const tnxId = this.currentTx?.tnxId; // ← master LC tnxId, used for PUT /amend/{tnxId}

//     if (!tnxId) {
//       this.snackBar.open('Transaction ID missing. Cannot amend.', 'Close', {
//         duration: 3000,
//       });
//       this.isSaving = false;
//       return;
//     }

//     this.api
//       .saveamendTransactionExportCollection(tnxId, payload)
//       .pipe(finalize(() => (this.isSaving = false)))
//       .subscribe({
//         next: (res: ExportCollectionTransaction) => {
//           this.currentTx = { ...this.currentTx, ...res };

//           console.log(
//             'Saved amendment, eventRefNo:',
//             this.currentTx.eventRefNo,
//           ); // verify here

//           this.snackBar.open(
//             `Amendment saved (Ref: ${res.eventRefNo ?? res.tnxId})`,
//             'Close',
//             { duration: 5000 },
//           );
//           setTimeout(
//             () =>
//               this.router.navigate(
//                 [
//                   '/dashboard/Trade-Services/export-collection/approved-inquiry-records',
//                 ],
//                 { queryParams: { tab: 'pending' } },
//               ),
//             50,
//           );
//         },
//         error: () => {
//           this.snackBar.open('Error saving amendment', 'Close', {
//             duration: 3000,
//           });
//         },
//       });
//   }

//   submit(): void {
//     const eventRefNo = this.currentTx?.eventRefNo;
//     console.log('Submitting amendment, eventRefNo:', this.currentTx.eventRefNo);

//     if (!eventRefNo) {
//       this.snackBar.open('Please save the amendment draft first.', 'Close', {
//         duration: 3000,
//       });
//       return;
//     }

//     const payload = {
//       ...this.flattenForm(), // merge current form data
//       event: 'AMD',
//       tnxId: this.tnxId,
//     };

//     this.api.submitAmendmentExportCollection(eventRefNo, payload).subscribe({
//       next: (res) => {
//         this.router.navigate(
//           ['/dashboard/Trade-Services/export-collection/success'],
//           {
//             state: { source: 'EXPORT_COLLECTION_AMD', transaction: res },
//           },
//         );
//         this.snackBar.open(
//           `Amendment Submitted (Ref: ${res.eventRefNo ?? res.tnxId})`,
//           'Close',
//           { duration: 5000 },
//         );
//         setTimeout(
//           () =>
//             this.router.navigate([
//               '/dashboard/Trade-Services/export-collection/approved-inquiry-records',
//             ]),
//           50,
//         );
//       },
//       error: () =>
//         this.snackBar.open('Error submitting amendment', 'Close', {
//           duration: 3000,
//         }),
//     });
//   }

//   back() {
//     this.router.navigate(['/dashboard']);
//   }
//   updateAttachments(files: File[]) {
//     const arr = this.ExportCollectionForm.get('attachments') as FormArray;
//     arr.clear();
//     files.forEach((file) =>
//       arr.push(
//         this.fb.group({
//           title: file.name.replace(/\.[^/.]+$/, ''),
//           fileName: file.name,
//           size: file.size,
//           type: file.type,
//           file: file,
//         }),
//       ),
//     );
//   }

//   update(): void {
//     if (this.ExportCollectionForm.invalid || !this.currentTx?.tnxId) {
//       this.snackBar.open('Invalid form or missing transaction ID', 'Close', {
//         duration: 3000,
//       });
//       return;
//     }

//     const payload = this.flattenForm();
//     payload.tnxId = this.tnxId;
//     console.log('Payload before update:', payload);
//     if (!payload.tnxId) {
//       console.error('TNX ID is missing!');
//       return;
//     }
//   }

//   approve(): void {
//     const eventRefNo = this.currentTx?.eventRefNo;
//     if (!eventRefNo) {
//       this.snackBar.open('Amendment reference not found.', 'Close', {
//         duration: 3000,
//       });
//       return;
//     }
//     const payload = {
//       ...this.flattenForm(), // merge current form data
//       event: 'AMD',
//       tnxId: this.tnxId,
//     };
//     this.api.approveAmendmentExportCollection(eventRefNo, payload).subscribe({
//       next: () => {
//         this.snackBar.open('Amendment approved. Live LC updated.', 'Close', {
//           duration: 3000,
//         });
//         setTimeout(
//           () =>
//             this.router.navigate([
//               '/dashboard/Trade-Services/export-collection/inquiries-records',
//             ]),
//           50,
//         );
//       },
//       error: () =>
//         this.snackBar.open('Approval failed', 'Close', { duration: 3000 }),
//     });
//   }

//   openReject(): void {
//     const eventRefNo = this.currentTx?.eventRefNo;
//     if (!eventRefNo) {
//       this.snackBar.open('Amendment reference not found.', 'Close', {
//         duration: 3000,
//       });
//       return;
//     }
//     const dialogRef = this.dialog.open(RejectDialogComponent, {
//       width: '400px',
//     });
//     dialogRef.afterClosed().subscribe((reason: string | undefined) => {
//       if (!reason) return;
//       this.api.rejectAmendmentExportCollection(eventRefNo, reason).subscribe({
//         next: () => {
//           this.snackBar.open(
//             'Amendment rejected. Live LC unchanged.',
//             'Close',
//             { duration: 3000 },
//           );
//           this.navigateBack('rejected');
//         },
//         error: () =>
//           this.snackBar.open('Failed to reject amendment', 'Close', {
//             duration: 3000,
//           }),
//       });
//     });
//   }
//   // reject(): void {
//   //   this.api.rejectTransaction(this.currentTx.tnxId!).subscribe({
//   //     next: () => this.navigateBack('rejected'),
//   //     error: () => this.snackBar.open('Rejection failed', 'Close', { duration: 3000 })
//   //   });
//   // }

//   private navigateBack(tab: string) {
//     this.router.navigate(
//       ['/dashboard/Trade-Services/export-collection/approved-inquiry-records'],
//       {
//         queryParams: { tab },
//       },
//     );
//   }

//   updateRejected(): void {
//     if (this.ExportCollectionForm.invalid || !this.currentTx?.tnxId) {
//       this.snackBar.open('Invalid form or missing transaction ID', 'Close', {
//         duration: 3000,
//       });
//       return;
//     }

//     const payload = this.flattenForm(); // flatten form values
//     payload.tnxId = this.currentTx.tnxId;

//     this.api
//       .updateRejectedTransactionExportCollection(payload.tnxId, payload)
//       .subscribe({
//         next: (res) => {
//           this.snackBar.open(
//             `Rejected transaction updated and moved back to Pending (TNX: ${res.tnxId})`,
//             'Close',
//             { duration: 3000 },
//           );

//           // Navigate back to inquiries with Pending tab
//           this.router.navigate(
//             ['/dashboard/Trade-Services/export-collection/inquiries-records'],
//             {
//               queryParams: { tab: 'pending' },
//             },
//           );
//         },
//         error: () => {
//           this.snackBar.open('Failed to update rejected transaction', 'Close', {
//             duration: 3000,
//           });
//         },
//       });
//   }
// }
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../../../../core/services/api.service';
import { Sidebar } from '../../../../../../../core/sidebar/sidebar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// CHILD COMPONENTS
import { GeneralDetails } from './components/general-details/general-details';
import { DrawerDraweeDetails } from './components/drawer-drawee-details/drawer-drawee-details';
import { BankDetailsComponent } from './components/bank-details/bank-details';
import { ShippingDetailsComponent } from './components/shipping-details/shipping-details';
import { PaymentAmountComponent } from './components/payment-amount/payment-amount';
import { CollectionInstructionsComponent } from './components/collection-instructions/collection-instructions';
import { License } from './components/license/license';
import { AttachmentsDocuments } from './components/attachments-documents/attachments-documents';
import { RejectDialogComponent } from '../../../../../../../shared/reject-dialog/reject-dialog';
import { finalize } from 'rxjs';

import { ExportCollectionTransaction } from '../../../../../../../core/models/export-collection';

@Component({
  selector: 'app-amend',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    GeneralDetails,
    DrawerDraweeDetails,
    BankDetailsComponent,
    PaymentAmountComponent,
    ShippingDetailsComponent,
    CollectionInstructionsComponent,
    License,
    AttachmentsDocuments,
    Sidebar,
    MatDialogModule,
    CommonModule,
    FormsModule,
    RouterOutlet,
  ],
  templateUrl: './amend.html',
  styleUrls: ['./amend.scss'],
})
export class Amend implements OnInit {
  currentStep = 0;
  ExportCollectionForm!: FormGroup;
  mode: 'CREATE' | 'UPDATE' | 'REJECTED' = 'CREATE';
  screenMode: 'EDIT' | 'SUBMITTED' | 'APPROVED' | 'FINAL' = 'EDIT';
  currentTx: ExportCollectionTransaction = {} as ExportCollectionTransaction;
  showUpdateSubmit = false;
  showApproveReject = false;
  rejectionReason = '';
  tnxId = '';
  companyId = '';
  eventType: string = '';
  eventRefNo: string = '';
  requestedMode: string = '';
  sourceTab: string = '';
  isSaving = false;
  isHistoricalView = false;

  permissionNames: string[] = [];

  hasPermission(permission: string): boolean {
    return this.permissionNames.some(
      (p) => p.trim().toLowerCase() === permission.toLowerCase(),
    );
  }

  exportCollectionSteps = [
    { label: 'General Details' },
    { label: 'Drawer & Drawee Details' },
    { label: 'Bank Details' },
    { label: 'Payment & Amount' },
    { label: 'Shipment Details' },
    { label: 'Collection Instruction' },
    { label: 'License' },
    { label: 'Attachments' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private api: ApiService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) {
    this.buildForm();
  }

  ngOnInit() {
    const storedPermissions = sessionStorage.getItem('permissionNames');
    if (storedPermissions) {
      try {
        this.permissionNames = JSON.parse(storedPermissions);
      } catch {
        this.permissionNames = [];
      }
    }
    setTimeout(() => {
      const sections = document.querySelectorAll('section');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.currentStep = Array.from(sections).indexOf(
                entry.target as HTMLElement,
              );
            }
          });
        },
        { threshold: 0.4, root: document.querySelector('.scroll-area') },
      );
      sections.forEach((section) => observer.observe(section));
    }, 200);

    this.route.queryParamMap.subscribe((params) => {
      this.requestedMode = params.get('mode')!;
    });

    const sessionData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    this.companyId = sessionData.companyId ?? '';

    // this.companyId = this.authservice.getCompanyId() || '';
    console.log('Company ID from route:', this.companyId);
    this.tnxId = this.route.snapshot.paramMap.get('tnxId') || '';
    console.log('TNX ID from route:', this.tnxId);

    this.route.paramMap.subscribe((params) => {
      this.tnxId = params.get('tnxId') || '';

      this.route.queryParamMap.subscribe((q) => {
        this.requestedMode = q.get('mode') ?? '';
        this.sourceTab = q.get('tab') ?? ''; // read tab
        this.eventType = q.get('eventType') ?? ''; // read eventType directly
        this.eventRefNo = q.get('eventRefNo') ?? '';

        console.log('tnxId:', this.tnxId);
        console.log('sourceTab:', this.sourceTab);
        console.log('eventType:', this.eventType);
        console.log('eventRefNo:', this.eventRefNo);

        if (this.tnxId) {
          this.enterEditMode(this.tnxId);
        } else {
          this.enterCreateMode();
        }
      });
    });
  }
  // const txFromState = history.state.transaction;
  // console.log('Transaction from state:', txFromState);
  //   this.route.paramMap.subscribe(params => {
  //     this.tnxId = params.get('tnxId') || '';

  //     this.route.queryParamMap.subscribe(q => {
  //       this.requestedMode = q.get('mode')!;

  //       if (this.tnxId) {
  //         this.enterEditMode(this.tnxId);
  //       } else {
  //         this.enterCreateMode();
  //       }
  //     });
  //   });
  // }

  private buildForm(): void {
    // Always initialize the form to avoid null bindings
    this.ExportCollectionForm = this.fb.group({
      generalDetails: this.fb.group({
        collectionType: [''],
        customerReference: [''],
        draweeReference: [''],
      }),
      DrawerDraweeDetails: this.fb.group({
        drawerName: [''],
        drawerAddress1: [''],
        drawerAddress2: [''],
        drawerAddress3: [''],
        drawerAddress4: [''],
        draweeName: [''],
        beneficiaryName: [''],
        draweeAddress1: [''],
        draweeAddress2: [''],
        draweeAddress3: [''],
        draweeAddress4: [''],
      }),
      bankDetails: this.fb.group({
        remittingBankName: [''],
        issuerReference: [''],
        principalAccount: [''],
        feeAccount: [''],
        presentingBankName: [''],
        bankAddress1: [''],
        bankAddress2: [''],
        bankAddress3: [''],
        bankAddress4: [''],
        collectingBankName: [''],
        swiftCode: [''],
        collectingReference: [''],
      }),
      PaymentAndAmount: this.fb.group({
        currency: [''],
        amount: ['', Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)],
        paymentType: [''],
        tenor: [''],
        paymentReference: [''],
      }),
      ShipmentDetails: this.fb.group({
        shippingMethod: [''],
        shipmentReference: [''],
        shippingFrom: [''],
        shippingTo: [''],
        shipmentDate: [''],
      }),
      CollectionInstruction: this.fb.group({
        advicePaymentBy: [''],
        adviceAcceptanceAndDueDateBy: [''],
        adviceReasonOfRefusalBy: [''],
        waiveAllChargesIfRefusedByDrawee: [''],
        protestInCaseOfNonPayment: [''],
        protestInCaseOfNonAcceptance: [''],
        acceptanceMayBeDeferredPendingArrival: ['Allowed'],
        warehouseOrInsureGoodsIfNecessary: ['Not Allowed'],
        openingCharges: [''],
        outsideCountryCharges: [''],
        referTo: [''],
      }),

      attachments: this.fb.array([]),
    });
  }

  private enterCreateMode(): void {
    this.mode = 'CREATE';
    this.showUpdateSubmit = false;
    this.showApproveReject = false;
    this.isHistoricalView = false;

    this.currentTx = {} as ExportCollectionTransaction;
    this.ExportCollectionForm.reset();
    this.buildForm();
  }

  // ======================================================
  private enterEditMode(tnxId: string): void {
    this.mode = 'UPDATE';

    // ── SCENARIO 1 ─────────────────────────────────────────────────────────
    // eventRefNo present → specific historical event snapshot, always read-only
    // Triggered from Inquiries Live tab row click
    // ────────────────────────────────────────────────────────────────────────
    if (this.eventRefNo) {
      this.isHistoricalView = true;
      this.api
        .getAmendmentByEventRefNoExportCollection(this.eventRefNo)
        .subscribe({
          next: (event) => {
            this.currentTx = event;
            this.screenMode = 'APPROVED';
            this.ExportCollectionForm.disable();
            this.patchForm(event);
          },
          error: () => {
            this.snackBar.open('Event snapshot not found', 'Close', {
              duration: 3000,
            });
            this.router.navigate([
              'dashboard/Trade-Services/export-collection/inquiries-records',
            ]);
          },
        });
      return;
    }

    // ── SCENARIO 2 ─────────────────────────────────────────────────────────
    // sourceTab='live', no eventRefNo → user wants to initiate/continue an amendment
    // Triggered from ApprovedInquiryRecords Live tab row click
    // Try to load existing AMD draft; if none exists, pre-populate from master LC
    // ────────────────────────────────────────────────────────────────────────
    if (this.sourceTab === 'live') {
      this.isHistoricalView = false;

      this.api.getAmendmentByTnxIdExportCollection(tnxId).subscribe({
        next: (event) => {
          // Existing AMD draft found — load it
          this.currentTx = event;
          this.patchForm(event);

          if (event.status === 'I') {
            this.screenMode = 'EDIT';
            this.ExportCollectionForm.enable();
          } else {
            // AMD already submitted/approved — shouldn't normally happen from Live tab
            // but handle defensively: show read-only
            this.screenMode = 'SUBMITTED';
            this.ExportCollectionForm.disable();
          }
        },
        error: () => {
          // No existing AMD draft — load master LC data to pre-populate form
          // The AMD event will only be created when user clicks Save
          this.api.getTransactionByTnxIdExportCollection(tnxId).subscribe({
            next: (tx) => {
              // Only store tnxId on currentTx — no eventRefNo exists yet
              this.currentTx = {
                tnxId: tx.tnxId,
              } as ExportCollectionTransaction;
              this.patchForm(tx);
              this.screenMode = 'EDIT';
              this.ExportCollectionForm.enable();
            },
            error: () => {
              this.snackBar.open('Transaction not found', 'Close', {
                duration: 3000,
              });
              this.router.navigate([
                'dashboard/Trade-Services/export-collection/inquiries-records',
              ]);
            },
          });
        },
      });
      return;
    }

    // ── SCENARIO 3 ─────────────────────────────────────────────────────────
    // AMD event tabs (pending/submitted/approved/rejected with eventType=AMD)
    // Triggered from ApprovedInquiryRecords non-live tabs
    // ────────────────────────────────────────────────────────────────────────
    const isAmendmentTab =
      this.eventType === 'AMD' ||
      this.sourceTab === 'pending' ||
      this.sourceTab === 'submitted' ||
      this.sourceTab === 'approved' ||
      this.sourceTab === 'rejected';

    if (isAmendmentTab) {
      this.isHistoricalView = false;

      this.api.getAmendmentByTnxIdExportCollection(tnxId).subscribe({
        next: (event) => {
          this.currentTx = event;
          this.patchForm(event);

          switch (event.status) {
            case 'I':
              this.mode = 'UPDATE';
              this.screenMode = 'EDIT';
              this.ExportCollectionForm.enable();
              break;
            case 'S':
              this.mode = 'UPDATE';
              this.screenMode = 'SUBMITTED';
              this.ExportCollectionForm.disable();
              break;
            case 'A':
              this.mode = 'UPDATE';
              this.screenMode = 'APPROVED';
              this.ExportCollectionForm.disable();
              break;
            case 'R':
              this.mode = 'REJECTED';
              this.screenMode = 'EDIT';
              this.ExportCollectionForm.enable();
              break;
            default:
              this.mode = 'UPDATE';
              this.screenMode = 'FINAL';
              this.ExportCollectionForm.disable();
          }
        },
        error: () => {
          this.snackBar.open('Amendment not found', 'Close', {
            duration: 3000,
          });
          this.router.navigate([
            'dashboard/Trade-Services/export-collection/inquiries-records',
          ]);
        },
      });
      return;
    }

    // ── SCENARIO 4 ─────────────────────────────────────────────────────────
    // Master LC (Enquiries non-live tabs with eventType=CRE or unset)
    // ────────────────────────────────────────────────────────────────────────
    this.isHistoricalView = false;
    this.api.getTransactionByTnxIdExportCollection(tnxId).subscribe({
      next: (tx) => {
        this.currentTx = tx;
        this.patchForm(tx);

        switch (tx.status) {
          case 'I':
            this.mode = 'UPDATE';
            this.screenMode = 'EDIT';
            this.ExportCollectionForm.enable();
            break;
          case 'S':
            this.mode = 'UPDATE';
            this.screenMode = 'SUBMITTED';
            this.ExportCollectionForm.disable();
            break;
          case 'A':
            this.mode = 'UPDATE';
            if (this.requestedMode === 'EDIT') {
              this.screenMode = 'EDIT';
              this.ExportCollectionForm.enable();
            } else {
              this.screenMode = 'APPROVED';
              this.ExportCollectionForm.disable();
            }
            break;
          case 'R':
            this.mode = 'REJECTED';
            this.screenMode = 'EDIT';
            this.ExportCollectionForm.enable();
            break;
          default:
            this.mode = 'UPDATE';
            this.screenMode = 'FINAL';
            this.ExportCollectionForm.disable();
        }
      },
      error: () => {
        this.snackBar.open('Transaction not found', 'Close', {
          duration: 3000,
        });
        this.router.navigate([
          'dashboard/Trade-Services/export-collection/inquiries-records',
        ]);
      },
    });
  }

  // Safe getters for html form access of the specific form groups
  get generalDetails(): FormGroup {
    return this.ExportCollectionForm.get('generalDetails') as FormGroup;
  }
  get DrawerDraweeDetails(): FormGroup {
    return this.ExportCollectionForm.get('DrawerDraweeDetails') as FormGroup;
  }
  get bankDetails(): FormGroup {
    return this.ExportCollectionForm.get('bankDetails') as FormGroup;
  }
  get PaymentAndAmount(): FormGroup {
    return this.ExportCollectionForm.get('PaymentAndAmount') as FormGroup;
  }
  get ShipmentDetails(): FormGroup {
    return this.ExportCollectionForm.get('ShipmentDetails') as FormGroup;
  }
  get CollectionInstruction(): FormGroup {
    return this.ExportCollectionForm.get('CollectionInstruction') as FormGroup;
  }
  get attachmentsArray(): FormArray {
    return this.ExportCollectionForm.get('attachments') as FormArray;
  }

  private patchForm(tx: ExportCollectionTransaction): void {
    this.ExportCollectionForm.patchValue({
      generalDetails: tx,
      DrawerDraweeDetails: tx,
      bankDetails: tx,
      PaymentAndAmount: tx,
      ShipmentDetails: tx,
      CollectionInstruction: tx,
    });
  }

  // scrollToSection(i: number) {
  //   this.currentStep = i;
  //   document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // }

  scrollToSection(index: number) {
    this.currentStep = index;
    const section = document.getElementById(`section-${index}`);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  private flattenForm(): ExportCollectionTransaction {
    return {
      companyId: this.companyId,
      ...this.ExportCollectionForm.value.generalDetails,
      ...this.ExportCollectionForm.value.DrawerDraweeDetails,
      ...this.ExportCollectionForm.value.bankDetails,
      ...this.ExportCollectionForm.value.PaymentAndAmount,
      ...this.ExportCollectionForm.value.ShipmentDetails,
      ...this.ExportCollectionForm.value.CollectionInstruction,
      ...this.ExportCollectionForm.value.instructionForm,
      attachments: this.ExportCollectionForm.value.attachments,
    };
  }

  saveForm(): void {
    if (this.isSaving) return;
    this.isSaving = true;

    if (!this.companyId) {
      this.snackBar.open('Session expired or company not found.', 'Close', {
        duration: 3000,
      });
      this.isSaving = false;
      return;
    }

    const payload = this.flattenForm();
    console.log('Payload before saving draft:', payload);
    const tnxId = this.currentTx?.tnxId; // ← master LC tnxId, used for PUT /amend/{tnxId}

    if (!tnxId) {
      this.snackBar.open('Transaction ID missing. Cannot amend.', 'Close', {
        duration: 3000,
      });
      this.isSaving = false;
      return;
    }

    this.api
      .saveamendTransactionExportCollection(tnxId, payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (res: ExportCollectionTransaction) => {
          this.currentTx = { ...this.currentTx, ...res };

          console.log(
            'Saved amendment, eventRefNo:',
            this.currentTx.eventRefNo,
          ); // verify here

          this.snackBar.open(
            `Amendment saved (Ref: ${res.eventRefNo ?? res.tnxId})`,
            'Close',
            { duration: 5000 },
          );
          setTimeout(
            () =>
              this.router.navigate(
                [
                  '/dashboard/Trade-Services/export-collection/approved-inquiry-records',
                ],
                { queryParams: { tab: 'pending' } },
              ),
            50,
          );
        },
        error: () => {
          this.snackBar.open('Error saving amendment', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  submit(): void {
    const eventRefNo = this.currentTx?.eventRefNo;
    console.log('Submitting amendment, eventRefNo:', this.currentTx.eventRefNo);

    if (!eventRefNo) {
      this.snackBar.open('Please save the amendment draft first.', 'Close', {
        duration: 3000,
      });
      return;
    }

    const payload = {
      ...this.flattenForm(), // merge current form data
      event: 'AMD',
      tnxId: this.tnxId,
    };

    this.api.submitAmendmentExportCollection(eventRefNo, payload).subscribe({
      next: (res) => {
        this.router.navigate(
          ['/dashboard/Trade-Services/export-collection/success'],
          {
            state: { source: 'EXPORT_COLLECTION_AMD', transaction: res },
          },
        );
        this.snackBar.open(
          `Amendment Submitted (Ref: ${res.eventRefNo ?? res.tnxId})`,
          'Close',
          { duration: 5000 },
        );
        setTimeout(
          () =>
            this.router.navigate([
              '/dashboard/Trade-Services/export-collection/approved-inquiry-records',
            ]),
          50,
        );
      },
      error: () =>
        this.snackBar.open('Error submitting amendment', 'Close', {
          duration: 3000,
        }),
    });
  }

  back() {
    this.router.navigate(['/dashboard']);
  }
  updateAttachments(files: File[]) {
    const arr = this.ExportCollectionForm.get('attachments') as FormArray;
    arr.clear();
    files.forEach((file) =>
      arr.push(
        this.fb.group({
          title: file.name.replace(/\.[^/.]+$/, ''),
          fileName: file.name,
          size: file.size,
          type: file.type,
          file: file,
        }),
      ),
    );
  }

  update(): void {
    if (this.ExportCollectionForm.invalid || !this.currentTx?.tnxId) {
      this.snackBar.open('Invalid form or missing transaction ID', 'Close', {
        duration: 3000,
      });
      return;
    }

    const payload = this.flattenForm();
    payload.tnxId = this.tnxId;
    console.log('Payload before update:', payload);
    if (!payload.tnxId) {
      console.error('TNX ID is missing!');
      return;
    }
  }

  approve(): void {
    const eventRefNo = this.currentTx?.eventRefNo;
    if (!eventRefNo) {
      this.snackBar.open('Amendment reference not found.', 'Close', {
        duration: 3000,
      });
      return;
    }
    const payload = {
      ...this.flattenForm(), // merge current form data
      event: 'AMD',
      tnxId: this.tnxId,
    };
    this.api.approveAmendmentExportCollection(eventRefNo, payload).subscribe({
      next: () => {
        this.snackBar.open('Amendment approved. Live LC updated.', 'Close', {
          duration: 3000,
        });
        setTimeout(
          () =>
            this.router.navigate([
              '/dashboard/Trade-Services/export-collection/inquiries-records',
            ]),
          50,
        );
      },
      error: () =>
        this.snackBar.open('Approval failed', 'Close', { duration: 3000 }),
    });
  }

  openReject(): void {
    const eventRefNo = this.currentTx?.eventRefNo;
    if (!eventRefNo) {
      this.snackBar.open('Amendment reference not found.', 'Close', {
        duration: 3000,
      });
      return;
    }
    const dialogRef = this.dialog.open(RejectDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((reason: string | undefined) => {
      if (!reason) return;
      this.api.rejectAmendmentExportCollection(eventRefNo, reason).subscribe({
        next: () => {
          this.snackBar.open(
            'Amendment rejected. Live LC unchanged.',
            'Close',
            { duration: 3000 },
          );
          this.navigateBack('rejected');
        },
        error: () =>
          this.snackBar.open('Failed to reject amendment', 'Close', {
            duration: 3000,
          }),
      });
    });
  }
  // reject(): void {
  //   this.api.rejectTransaction(this.currentTx.tnxId!).subscribe({
  //     next: () => this.navigateBack('rejected'),
  //     error: () => this.snackBar.open('Rejection failed', 'Close', { duration: 3000 })
  //   });
  // }

  private navigateBack(tab: string) {
    this.router.navigate(
      ['/dashboard/Trade-Services/export-collection/approved-inquiry-records'],
      {
        queryParams: { tab },
      },
    );
  }

  updateRejected(): void {
    if (this.ExportCollectionForm.invalid || !this.currentTx?.tnxId) {
      this.snackBar.open('Invalid form or missing transaction ID', 'Close', {
        duration: 3000,
      });
      return;
    }

    const payload = this.flattenForm(); // flatten form values
    payload.tnxId = this.currentTx.tnxId;

    this.api
      .updateRejectedTransactionExportCollection(payload.tnxId, payload)
      .subscribe({
        next: (res) => {
          this.snackBar.open(
            `Rejected transaction updated and moved back to Pending (TNX: ${res.tnxId})`,
            'Close',
            { duration: 3000 },
          );

          // Navigate back to inquiries with Pending tab
          this.router.navigate(
            ['/dashboard/Trade-Services/export-collection/inquiries-records'],
            {
              queryParams: { tab: 'pending' },
            },
          );
        },
        error: () => {
          this.snackBar.open('Failed to update rejected transaction', 'Close', {
            duration: 3000,
          });
        },
      });
  }
}