// import { Component, OnInit } from '@angular/core';
// import { Router, RouterLink, ActivatedRoute } from '@angular/router';
// import { MatIconModule } from '@angular/material/icon';
// import { CommonModule, isPlatformBrowser } from '@angular/common';
// import {
//   ReactiveFormsModule,
//   FormBuilder,
//   FormGroup,
//   Validators,
//   FormArray,
// } from '@angular/forms';
// import { MatButtonModule } from '@angular/material/button';
// import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
// import { MatDialogModule, MatDialog } from '@angular/material/dialog';
// import { Sidebar } from '../../../../core/sidebar/sidebar';
// import { generalDetails } from './../../../USER/Trade-Services/undertaking-issuance/components/general-details/general-details';
// import { ApplicationBeneficiary } from './../../../USER/Trade-Services/undertaking-issuance/components/application-beneficiary/application-beneficiary';
// import { BankDetails } from './../../../USER/Trade-Services/undertaking-issuance/components/bank-details/bank-details';
// import { UndertakingDetails } from './../../../USER/Trade-Services/undertaking-issuance/components/undertaking-details/undertaking-details';
// import { InstructionsBank } from './../../../USER/Trade-Services/undertaking-issuance/components/instructions-bank/instructions-bank';
// import { Attachments } from './../../../USER/Trade-Services/undertaking-issuance/components/attachments/attachments';
// import { UndertakingIssuanceService } from '../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';
// import { AuthService } from '../../../../core/services/auth.service';
// import { RejectDialogComponent } from '../../../../shared/reject-dialog/reject-dialog';
// import { ApiService } from '../../../../core/services/api.service';
// import { UndertakingGuarantee } from '../../../../core/models/undertaking-lc';

// @Component({
//   selector: 'app-undertaking-issued',
//   templateUrl: './undertaking-issuance.html',
//   styleUrls: ['./undertaking-issuance.scss'],
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     MatButtonModule,
//     MatSnackBarModule,
//     MatDialogModule,
//     Sidebar,
//     generalDetails,
//     ApplicationBeneficiary,
//     BankDetails,
//     UndertakingDetails,
//     InstructionsBank,
//     Attachments,
//   ],
// })
// export class UndertakingIssuance implements OnInit {
//   currentStep = 0;
//   mode: 'CREATE' | 'UPDATE' | 'REJECTED' = 'CREATE';
//   screenMode: 'EDIT' | 'SUBMITTED' | 'APPROVED' | 'FINAL' = 'EDIT';
//   currentTx: UndertakingGuarantee = {} as UndertakingGuarantee;
//   showUpdateSubmit = false;
//   showApproveReject = false;
//   rejectionReason = '';
//   tnxId = '';
//   companyId = '';
//   // Form & Data State
//   undertakingForm!: FormGroup;
//   isLoading = false; // Add loading state

//   // Sidebar Steps
//   undertakingSteps = [
//     { label: 'General Details' },
//     { label: 'Applicant & Beneficiary' },
//     { label: 'Bank Details' },
//     { label: 'Undertaking Details' },
//     { label: 'Instructions' },
//     { label: 'Attachments' },
//   ];

//   private scrollSpyObserver?: IntersectionObserver;

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private snackBar: MatSnackBar,
//     private api: ApiService,
//     private route: ActivatedRoute,
//     private dialog: MatDialog,
//     private transactionService: UndertakingIssuanceService,
//     private authservice: AuthService,
//   ) {
//     this.buildForm();
//   }

//   ngOnInit() {
//     setTimeout(() => {
//       const scrollArea = document.querySelector('.scroll-area') as HTMLElement;
//       if (!scrollArea) return;

//       const sections = Array.from(
//         scrollArea.querySelectorAll('section[id^="section-"]'),
//       ) as HTMLElement[];

//       this.scrollSpyObserver = new IntersectionObserver(
//         (entries) => {
//           for (const entry of entries) {
//             if (entry.isIntersecting) {
//               const index = sections.indexOf(entry.target as HTMLElement);
//               if (index !== -1) {
//                 this.currentStep = index;
//               }
//             }
//           }
//         },
//         {
//           threshold: 0.4,
//           root: scrollArea,
//         },
//       );

//       sections.forEach((section) => this.scrollSpyObserver!.observe(section));
//     }, 200);

//     const navState = history.state;

//     if (navState?.mode) {
//       this.screenMode = navState.mode;
//     }

//     this.companyId = this.authservice.getCompanyId() || '';
//     console.log('Company ID from route:', this.companyId);
//     this.tnxId = this.route.snapshot.paramMap.get('tnxId') || '';
//     console.log('TNX ID from route:', this.tnxId);
//     // const txFromState = history.state.transaction;
//     // console.log('Transaction from state:', txFromState);
//     this.route.paramMap.subscribe((params) => {
//       const tnxId = params.get('tnxId');
//       if (tnxId) {
//         this.enterEditMode(tnxId);
//       } else {
//         this.enterCreateMode();
//       }
//     });
//   }

//   ngOnDestroy(): void {
//     this.scrollSpyObserver?.disconnect();
//   }

//   private buildForm(): void {
//     this.undertakingForm = this.fb.group({
//       generalDetails: this.fb.group({
//         productType: ['Undertaking'],
//         modeOfTransmission: ['SWIFT'],
//         formOfUndertaking: [''],
//         purpose: [''],
//       }),
//       applicantBeneficiary: this.fb.group({
//         // applicantName: ['', Validators.required],
//         applicantName: [''],
//         applicantAddress1: [''],
//         applicantAddress2: [''],
//         applicantAddress3: [''],
//         applicantAddress4: [''],
//         applicantCountry: [''],
//         beneficiaryName: [''],
//         beneficiaryAddress1: [''],
//         beneficiaryAddress2: [''],
//         beneficiaryAddress3: [''],
//         beneficiaryAddress4: [''],
//         beneficiaryCountry: [''],
//       }),
//       bankForm: this.fb.group({
//         recipientBankName: [''],
//         issuerReference: [''],
//         issuanceType: [''],
//         swiftcode: [''],
//         bankName: [''],
//         bankAddress1: [''],
//         bankAddress2: [''],
//         bankAddress3: [''],
//         bankAddress4: [''],
//         bankCountry: [''],
//       }),
//       undertakingDetails: this.fb.group({
//         typeOfUndertaking: [''],
//         effectiveOption: [''],
//         expiryType: [''],
//         expiryDate: [''],
//         currency: ['USD'],
//         undertakingAmount: [null],
//         variationPlus: [''],
//         variationMinus: [''],
//         issuanceCharges: [''],
//         correspondentCharges: [''],
//         supplementaryInfo: [''],
//         textOfUndertakingInfo: [''],
//         underlyingTransactionInfo: [''],
//         presentationInfo: [''],
//         basicExtensionType: [''],
//         increaseDecreaseType: [''],
//         contractType: [''],
//         contractDate: [''],
//         contractCurrency: [''],
//         contractAmount: [''],
//         percentageCovered: [''],
//         contractNarrative: [''],
//         applicableRules: [''],
//         countrySubdivision: [''],
//         jurisdiction: [''],
//         demandOption: [''],
//         governingLawsType: [''],
//         languageType: [''],
//         tsOption: [''],
//       }),
//       instructions: this.fb.group({
//         deliveryType: [''],
//         deliveryMode: [''],
//         deliveryTo: [''],
//         principalAccount: [''],
//         feeAccount: [''],
//         otherInstructions: [''],
//       }),
//       attachments: this.fb.array([]),
//     });
//   }

//   private enterCreateMode(): void {
//     this.mode = 'CREATE';
//     this.showUpdateSubmit = false;
//     this.showApproveReject = false;
//     this.currentTx = {} as UndertakingGuarantee;
//     this.undertakingForm.reset();
//     this.buildForm();
//   }
//   private enterEditMode(tnxId: string): void {
//     this.mode = 'UPDATE';
//     this.api.getUndertakingByTnxId(tnxId).subscribe({
//       next: (tx) => {
//         this.currentTx = tx;
//         this.patchForm(tx);

//         switch (tx.status) {
//           case 'I': // pending
//             this.mode = 'UPDATE';
//             this.screenMode = 'EDIT';
//             this.undertakingForm.enable();
//             // this.showUpdateSubmit = true;
//             // this.showApproveReject = false;
//             break;
//           case 'S': // submitted
//             this.mode = 'UPDATE';
//             this.screenMode = 'SUBMITTED';
//             this.undertakingForm.disable();
//             // this.showUpdateSubmit = false;
//             // this.showApproveReject = true;
//             break;
//           case 'A': // Approved
//             this.mode = 'UPDATE';
//             this.screenMode = 'APPROVED';
//             this.undertakingForm.disable();
//             break;

//           case 'R': // Rejected
//             this.mode = 'REJECTED';
//             this.screenMode = 'EDIT';
//             this.undertakingForm.enable(); // allow correction
//             break;
//           default:
//             this.mode = 'UPDATE';
//             this.screenMode = 'FINAL';
//             this.undertakingForm.disable();
//           // this.showUpdateSubmit = false;
//           // this.showApproveReject = false;
//         }
//       },
//       error: () => {
//         this.snackBar.open('Transaction not found', 'Close', {
//           duration: 3000,
//         });
//         this.router.navigate([
//           '/dashboard/Trade-Services/undertaking-issuance/inquiries-records',
//         ]);
//       },
//     });
//   }

//   get generalDetails(): FormGroup {
//     return this.undertakingForm.get('generalDetails') as FormGroup;
//   }
//   get applicantBeneficiary(): FormGroup {
//     return this.undertakingForm.get('applicantBeneficiary') as FormGroup;
//   }
//   get bankForm(): FormGroup {
//     return this.undertakingForm.get('bankForm') as FormGroup;
//   }
//   get undertakingDetails(): FormGroup {
//     return this.undertakingForm.get('undertakingDetails') as FormGroup;
//   }
//   get instructions(): FormGroup {
//     return this.undertakingForm.get('instructions') as FormGroup;
//   }

//   private patchForm(tx: UndertakingGuarantee): void {
//     this.undertakingForm.patchValue({
//       generalDetails: tx,
//       applicantBeneficiary: tx,
//       bankForm: tx,
//       undertakingDetails: tx,
//       instructions: tx,
//     });
//   }

//   scrollToSection(i: number) {
//     this.currentStep = i;
//     const section = document.getElementById(`section-${i}`);
//     section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
//   }

//   private flattenForm(): UndertakingGuarantee {
//     return {
//       companyId: this.companyId,
//       ...this.undertakingForm.value.generalDetails,
//       ...this.undertakingForm.value.applicantBeneficiary,
//       ...this.undertakingForm.value.bankForm,
//       ...this.undertakingForm.value.undertakingDetails,
//       ...this.undertakingForm.value.instructions,
//       attachments: this.undertakingForm.value.attachments,
//     };
//   }
//   // ==========================================
//   // BUTTON ACTIONS
//   // ==========================================

//   saveForm(): void {
//     if (this.undertakingForm.invalid) {
//       this.undertakingForm.markAllAsTouched();
//       this.snackBar.open(
//         'Please complete all required fields before saving.',
//         'Close',
//         { duration: 3000 },
//       );
//       return;
//     }
//     // Flatten nested form groups into single object
//     const payload = this.flattenForm();
//     console.log('Payload before saving draft:', payload);

//     this.api.saveUndertakingPending(payload).subscribe({
//       next: (res: UndertakingGuarantee) => {
//         // this.navigateToSuccess(res.id, res.channelReference || 'REF', 'pending', 'Draft Saved Successfully');
//         this.snackBar.open(
//           `Draft saved successfully (TNX ID: ${res.tnxId})`,
//           'Close',
//           { duration: 5000 },
//         );
//         setTimeout(
//           () =>
//             this.router.navigate([
//               '/dashboard/Trade-Services/undertaking-issuance/inquiries-records',
//             ]),
//           50,
//         );
//       },
//       error: (err) => {
//         this.snackBar.open('Error saving draft: ' + err.message, 'Close', {
//           duration: 5000,
//         });
//       },
//     });
//   }

//   submitForm(): void {
//     const tnxId = this.currentTx?.tnxId;
//     const companyId = this.currentTx?.companyId;
//     if (!tnxId) {
//       this.snackBar.open(
//         'Transaction ID not found. Please save the draft first.',
//         'Close',
//         { duration: 3000 },
//       );
//       return;
//     }
//     // if (!companyId) {
//     //   this.snackBar.open('Company ID not found. Please save the draft first.', 'Close', { duration: 3000 });
//     //   return;
//     // }
//     const payload = {
//       ...this.flattenForm(), // merge current form data
//       event: 'CRE',
//       tnxId: this.tnxId,
//     };
//     this.api.submitUndertaking(tnxId, payload).subscribe({
//       next: (res: UndertakingGuarantee) => {
//         this.transactionService.addOrUpdateTransaction(res);
//         this.router.navigate(
//           ['/dashboard/Trade-Services/undertaking-issuance/success'],
//           {
//             state: { source: 'UNDERTAKING_ISSUANCE', transaction: res },
//           },
//         );
//       },
//       error: () => {
//         this.snackBar.open('Error submitting transaction', 'Close', {
//           duration: 3000,
//         });
//       },
//     });
//   }

//   back() {
//     this.router.navigate(['/dashboard']);
//   }

//   updateAttachments(files: File[]) {
//     const arr = this.undertakingForm.get('attachments') as FormArray;
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

//   updateForm(): void {
//     if (this.undertakingForm.invalid || !this.currentTx?.tnxId) {
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

//     this.api.updateUndertakingPendingByTnxId(payload).subscribe({
//       next: () => {
//         // this.transactionService.addOrUpdateTransaction(res);
//         this.snackBar.open(
//           `Data successfully updated (${payload.tnxId})`,
//           'Close',
//           { duration: 3000 },
//         );

//         setTimeout(
//           () =>
//             this.router.navigate([
//               '/dashboard/Trade-Services/undertaking-issuance/inquiries-records',
//             ]),
//           300,
//         );
//       },
//       error: () => {
//         this.snackBar.open('Error updating transaction', 'Close', {
//           duration: 3000,
//         });
//       },
//     });
//   }

//   approve(): void {
//     this.api
//       .approveUndertaking(this.currentTx.tnxId!, this.currentTx)
//       .subscribe({
//         next: () => this.navigateBack('approved'),
//         error: () =>
//           this.snackBar.open('Approval failed', 'Close', { duration: 3000 }),
//       });
//   }

//   openReject(): void {
//     const dialogRef = this.dialog.open(RejectDialogComponent, {
//       width: '400px',
//     });

//     dialogRef.afterClosed().subscribe((reason: string | undefined) => {
//       if (!reason) return; // user cancelled

//       this.api.rejectUndertaking(this.currentTx.tnxId!, reason).subscribe({
//         next: () => {
//           this.snackBar.open('Transaction rejected successfully', 'Close', {
//             duration: 3000,
//           });
//           this.navigateBack('rejected'); // send user to rejected tab
//         },
//         error: () => {
//           this.snackBar.open('Failed to reject transaction', 'Close', {
//             duration: 3000,
//           });
//         },
//       });
//     });
//   }

//   updateRejected(): void {
//     if (this.undertakingForm.invalid || !this.currentTx?.tnxId) {
//       this.snackBar.open('Invalid form or missing transaction ID', 'Close', {
//         duration: 3000,
//       });
//       return;
//     }

//     const payload = this.flattenForm(); // flatten form values
//     payload.tnxId = this.currentTx.tnxId;

//     this.api.updateRejectedUndertaking(payload.tnxId, payload).subscribe({
//       next: (res) => {
//         this.snackBar.open(
//           `Rejected transaction updated and moved back to Pending (TNX: ${res.tnxId})`,
//           'Close',
//           { duration: 3000 },
//         );

//         // Navigate back to inquiries with Pending tab
//         this.router.navigate([
//           '/dashboard/Trade-Services/undertaking-issuance/inquiries-records',
//         ]);
//       },
//       error: () => {
//         this.snackBar.open('Failed to update rejected transaction', 'Close', {
//           duration: 3000,
//         });
//       },
//     });
//   }

//   // back(): void {
//   //   let tab = 'pending';
//   //   if (this.pageMode === 'CHECKER') tab = 'submitted';
//   //   if (this.pageMode === 'VIEW') tab = 'approved';
//   //   if (this.pageMode === 'CORRECT') tab = 'rejected';

//   //   this.router.navigate(['/undertaking-issuance/inquiries-records'], { queryParams: { tab } });
//   // }

//   // ==========================================
//   // NAVIGATION HELPER
//   // ==========================================

//   private navigateBack(tab: string) {
//     this.router.navigate(
//       ['/dashboard/Trade-Services/undertaking-issuance/inquiries-records'],
//       {
//         relativeTo: this.route,
//         queryParamsHandling: 'merge',
//         queryParams: { tab },
//       },
//     );
//   }
// }

import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Sidebar } from '../../../../core/sidebar/sidebar';
import { generalDetails } from './../../../USER/Trade-Services/undertaking-issuance/components/general-details/general-details';
import { ApplicationBeneficiary } from './../../../USER/Trade-Services/undertaking-issuance/components/application-beneficiary/application-beneficiary';
import { BankDetails } from './../../../USER/Trade-Services/undertaking-issuance/components/bank-details/bank-details';
import { UndertakingDetails } from './../../../USER/Trade-Services/undertaking-issuance/components/undertaking-details/undertaking-details';
import { InstructionsBank } from './../../../USER/Trade-Services/undertaking-issuance/components/instructions-bank/instructions-bank';
import { Attachments } from './../../../USER/Trade-Services/undertaking-issuance/components/attachments/attachments';
import { UndertakingIssuanceService } from '../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';
import { AuthService } from '../../../../core/services/auth.service';
import { RejectDialogComponent } from '../../../../shared/reject-dialog/reject-dialog';
import { ApiService } from '../../../../core/services/api.service';
import { UndertakingGuarantee } from '../../../../core/models/undertaking-lc';

@Component({
  selector: 'app-undertaking-issued',
  templateUrl: './undertaking-issuance.html',
  styleUrls: ['./undertaking-issuance.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    Sidebar,
    generalDetails,
    ApplicationBeneficiary,
    BankDetails,
    UndertakingDetails,
    InstructionsBank,
    Attachments,
  ],
})
export class UndertakingIssuance implements OnInit {
  currentStep = 0;
  mode: 'CREATE' | 'UPDATE' | 'REJECTED' = 'CREATE';
  screenMode: 'EDIT' | 'SUBMITTED' | 'APPROVED' | 'FINAL' = 'EDIT';
  currentTx: UndertakingGuarantee = {} as UndertakingGuarantee;
  showUpdateSubmit = false;
  showApproveReject = false;
  rejectionReason = '';
  tnxId = '';
  companyId = '';
  // Form & Data State
  undertakingForm!: FormGroup;
  isLoading = false; // Add loading state

  // Sidebar Steps
  undertakingSteps = [
    { label: 'General Details' },
    { label: 'Applicant & Beneficiary' },
    { label: 'Bank Details' },
    { label: 'Undertaking Details' },
    { label: 'Instructions' },
    { label: 'Attachments' },
  ];

  // private scrollSpyObserver?: IntersectionObserver;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private api: ApiService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private transactionService: UndertakingIssuanceService,
    private authservice: AuthService,
  ) {
    this.buildForm();
  }

  private scrollSpyHandler?: () => void;

  ngOnInit() {
    setTimeout(() => {
      const scrollArea = document.querySelector('.scroll-area') as HTMLElement;
      if (!scrollArea) return;

      const sections = Array.from(
        scrollArea.querySelectorAll('section[id^="section-"]'),
      ) as HTMLElement[];

      if (sections.length === 0) return;

      // Position-based scroll spy: track whichever section's top edge is
      // closest to the top of the scroll container. This works correctly
      // regardless of how tall an individual section is (unlike a
      // ratio-based IntersectionObserver threshold, which can fail to
      // fire for sections taller than the viewport).
      const updateActiveStep = () => {
        const containerRect = scrollArea.getBoundingClientRect();
        const targetPosition = containerRect.top + 20;

        let closestIndex = 0;
        let smallestDistance = Infinity;

        sections.forEach((section, index) => {
          const sectionRect = section.getBoundingClientRect();
          const distance = Math.abs(sectionRect.top - targetPosition);

          if (distance < smallestDistance) {
            smallestDistance = distance;
            closestIndex = index;
          }
        });

        this.currentStep = closestIndex;
      };

      this.scrollSpyHandler = updateActiveStep;
      scrollArea.addEventListener('scroll', this.scrollSpyHandler);
      updateActiveStep();
    }, 200);

    const navState = history.state;

    if (navState?.mode) {
      this.screenMode = navState.mode;
    }

    this.companyId = this.authservice.getCompanyId() || '';
    console.log('Company ID from route:', this.companyId);
    this.tnxId = this.route.snapshot.paramMap.get('tnxId') || '';
    console.log('TNX ID from route:', this.tnxId);
    // const txFromState = history.state.transaction;
    // console.log('Transaction from state:', txFromState);
    this.route.paramMap.subscribe((params) => {
      const tnxId = params.get('tnxId');
      if (tnxId) {
        this.enterEditMode(tnxId);
      } else {
        this.enterCreateMode();
      }
    });
  }

  ngOnDestroy(): void {
    const scrollArea = document.querySelector('.scroll-area') as HTMLElement;
    if (scrollArea && this.scrollSpyHandler) {
      scrollArea.removeEventListener('scroll', this.scrollSpyHandler);
    }
  }

  private buildForm(): void {
    this.undertakingForm = this.fb.group({
      generalDetails: this.fb.group({
        productType: ['Undertaking'],
        modeOfTransmission: ['SWIFT'],
        formOfUndertaking: [''],
        purpose: [''],
      }),
      applicantBeneficiary: this.fb.group({
        // applicantName: ['', Validators.required],
        applicantName: [''],
        applicantAddress1: [''],
        applicantAddress2: [''],
        applicantAddress3: [''],
        applicantAddress4: [''],
        applicantCountry: [''],
        beneficiaryName: [''],
        beneficiaryAddress1: [''],
        beneficiaryAddress2: [''],
        beneficiaryAddress3: [''],
        beneficiaryAddress4: [''],
        beneficiaryCountry: [''],
      }),
      bankForm: this.fb.group({
        recipientBankName: [''],
        issuerReference: [''],
        issuanceType: [''],
        swiftcode: [''],
        bankName: [''],
        bankAddress1: [''],
        bankAddress2: [''],
        bankAddress3: [''],
        bankAddress4: [''],
        bankCountry: [''],
      }),
      undertakingDetails: this.fb.group({
        typeOfUndertaking: [''],
        effectiveOption: [''],
        expiryType: [''],
        expiryDate: [''],
        currency: ['USD'],
        undertakingAmount: [null],
        variationPlus: [''],
        variationMinus: [''],
        issuanceCharges: [''],
        correspondentCharges: [''],
        supplementaryInfo: [''],
        textOfUndertakingInfo: [''],
        underlyingTransactionInfo: [''],
        presentationInfo: [''],
        basicExtensionType: [''],
        increaseDecreaseType: [''],
        contractType: [''],
        contractDate: [''],
        contractCurrency: [''],
        contractAmount: [''],
        percentageCovered: [''],
        contractNarrative: [''],
        applicableRules: [''],
        countrySubdivision: [''],
        jurisdiction: [''],
        demandOption: [''],
        governingLawsType: [''],
        languageType: [''],
        tsOption: [''],
      }),
      instructions: this.fb.group({
        deliveryType: [''],
        deliveryMode: [''],
        deliveryTo: [''],
        principalAccount: [''],
        feeAccount: [''],
        otherInstructions: [''],
      }),
      attachments: this.fb.array([]),
    });
  }

  private enterCreateMode(): void {
    this.mode = 'CREATE';
    this.showUpdateSubmit = false;
    this.showApproveReject = false;
    this.currentTx = {} as UndertakingGuarantee;
    this.undertakingForm.reset();
    this.buildForm();
  }
  private enterEditMode(tnxId: string): void {
    this.mode = 'UPDATE';
    this.api.getUndertakingByTnxId(tnxId).subscribe({
      next: (tx) => {
        this.currentTx = tx;
        this.patchForm(tx);

        switch (tx.status) {
          case 'I': // pending
            this.mode = 'UPDATE';
            this.screenMode = 'EDIT';
            this.undertakingForm.enable();
            // this.showUpdateSubmit = true;
            // this.showApproveReject = false;
            break;
          case 'S': // submitted
            this.mode = 'UPDATE';
            this.screenMode = 'SUBMITTED';
            this.undertakingForm.disable();
            // this.showUpdateSubmit = false;
            // this.showApproveReject = true;
            break;
          case 'A': // Approved
            this.mode = 'UPDATE';
            this.screenMode = 'APPROVED';
            this.undertakingForm.disable();
            break;

          case 'R': // Rejected
            this.mode = 'REJECTED';
            this.screenMode = 'EDIT';
            this.undertakingForm.enable(); // allow correction
            break;
          default:
            this.mode = 'UPDATE';
            this.screenMode = 'FINAL';
            this.undertakingForm.disable();
          // this.showUpdateSubmit = false;
          // this.showApproveReject = false;
        }
      },
      error: () => {
        this.snackBar.open('Transaction not found', 'Close', {
          duration: 3000,
        });
        this.router.navigate([
          '/dashboard/Trade-Services/undertaking-issuance/inquiries-records',
        ]);
      },
    });
  }

  get generalDetails(): FormGroup {
    return this.undertakingForm.get('generalDetails') as FormGroup;
  }
  get applicantBeneficiary(): FormGroup {
    return this.undertakingForm.get('applicantBeneficiary') as FormGroup;
  }
  get bankForm(): FormGroup {
    return this.undertakingForm.get('bankForm') as FormGroup;
  }
  get undertakingDetails(): FormGroup {
    return this.undertakingForm.get('undertakingDetails') as FormGroup;
  }
  get instructions(): FormGroup {
    return this.undertakingForm.get('instructions') as FormGroup;
  }

  private patchForm(tx: UndertakingGuarantee): void {
    this.undertakingForm.patchValue({
      generalDetails: tx,
      applicantBeneficiary: tx,
      bankForm: tx,
      undertakingDetails: tx,
      instructions: tx,
    });
  }

  scrollToSection(i: number) {
    this.currentStep = i;
    const section = document.getElementById(`section-${i}`);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private flattenForm(): UndertakingGuarantee {
    return {
      companyId: this.companyId,
      ...this.undertakingForm.value.generalDetails,
      ...this.undertakingForm.value.applicantBeneficiary,
      ...this.undertakingForm.value.bankForm,
      ...this.undertakingForm.value.undertakingDetails,
      ...this.undertakingForm.value.instructions,
      attachments: this.undertakingForm.value.attachments,
    };
  }
  // ==========================================
  // BUTTON ACTIONS
  // ==========================================

  saveForm(): void {
    if (this.undertakingForm.invalid) {
      this.undertakingForm.markAllAsTouched();
      this.snackBar.open(
        'Please complete all required fields before saving.',
        'Close',
        { duration: 3000 },
      );
      return;
    }
    // Flatten nested form groups into single object
    const payload = this.flattenForm();
    console.log('Payload before saving draft:', payload);

    this.api.saveUndertakingPending(payload).subscribe({
      next: (res: UndertakingGuarantee) => {
        // this.navigateToSuccess(res.id, res.channelReference || 'REF', 'pending', 'Draft Saved Successfully');
        this.snackBar.open(
          `Draft saved successfully (TNX ID: ${res.tnxId})`,
          'Close',
          { duration: 5000 },
        );
        setTimeout(
          () =>
            this.router.navigate([
              '/dashboard/Trade-Services/undertaking-issuance/inquiries-records',
            ]),
          50,
        );
      },
      error: (err) => {
        this.snackBar.open('Error saving draft: ' + err.message, 'Close', {
          duration: 5000,
        });
      },
    });
  }

  submitForm(): void {
    const tnxId = this.currentTx?.tnxId;
    const companyId = this.currentTx?.companyId;
    if (!tnxId) {
      this.snackBar.open(
        'Transaction ID not found. Please save the draft first.',
        'Close',
        { duration: 3000 },
      );
      return;
    }
    // if (!companyId) {
    //   this.snackBar.open('Company ID not found. Please save the draft first.', 'Close', { duration: 3000 });
    //   return;
    // }
    const payload = {
      ...this.flattenForm(), // merge current form data
      event: 'CRE',
      tnxId: this.tnxId,
    };
    this.api.submitUndertaking(tnxId, payload).subscribe({
      next: (res: UndertakingGuarantee) => {
        this.transactionService.addOrUpdateTransaction(res);
        this.router.navigate(
          ['/dashboard/Trade-Services/undertaking-issuance/success'],
          {
            state: { source: 'UNDERTAKING_ISSUANCE', transaction: res },
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

  back() {
    this.router.navigate(['/dashboard']);
  }

  updateAttachments(files: File[]) {
    const arr = this.undertakingForm.get('attachments') as FormArray;
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

  updateForm(): void {
    if (this.undertakingForm.invalid || !this.currentTx?.tnxId) {
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

    this.api.updateUndertakingPendingByTnxId(payload).subscribe({
      next: () => {
        // this.transactionService.addOrUpdateTransaction(res);
        this.snackBar.open(
          `Data successfully updated (${payload.tnxId})`,
          'Close',
          { duration: 3000 },
        );

        setTimeout(
          () =>
            this.router.navigate([
              '/dashboard/Trade-Services/undertaking-issuance/inquiries-records',
            ]),
          300,
        );
      },
      error: () => {
        this.snackBar.open('Error updating transaction', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  approve(): void {
    this.api
      .approveUndertaking(this.currentTx.tnxId!, this.currentTx)
      .subscribe({
        next: () => this.navigateBack('approved'),
        error: () =>
          this.snackBar.open('Approval failed', 'Close', { duration: 3000 }),
      });
  }

  openReject(): void {
    const dialogRef = this.dialog.open(RejectDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((reason: string | undefined) => {
      if (!reason) return; // user cancelled

      this.api.rejectUndertaking(this.currentTx.tnxId!, reason).subscribe({
        next: () => {
          this.snackBar.open('Transaction rejected successfully', 'Close', {
            duration: 3000,
          });
          this.navigateBack('rejected'); // send user to rejected tab
        },
        error: () => {
          this.snackBar.open('Failed to reject transaction', 'Close', {
            duration: 3000,
          });
        },
      });
    });
  }

  updateRejected(): void {
    if (this.undertakingForm.invalid || !this.currentTx?.tnxId) {
      this.snackBar.open('Invalid form or missing transaction ID', 'Close', {
        duration: 3000,
      });
      return;
    }

    const payload = this.flattenForm(); // flatten form values
    payload.tnxId = this.currentTx.tnxId;

    this.api.updateRejectedUndertaking(payload.tnxId, payload).subscribe({
      next: (res) => {
        this.snackBar.open(
          `Rejected transaction updated and moved back to Pending (TNX: ${res.tnxId})`,
          'Close',
          { duration: 3000 },
        );

        // Navigate back to inquiries with Pending tab
        this.router.navigate([
          '/dashboard/Trade-Services/undertaking-issuance/inquiries-records',
        ]);
      },
      error: () => {
        this.snackBar.open('Failed to update rejected transaction', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  // back(): void {
  //   let tab = 'pending';
  //   if (this.pageMode === 'CHECKER') tab = 'submitted';
  //   if (this.pageMode === 'VIEW') tab = 'approved';
  //   if (this.pageMode === 'CORRECT') tab = 'rejected';

  //   this.router.navigate(['/undertaking-issuance/inquiries-records'], { queryParams: { tab } });
  // }

  // ==========================================
  // NAVIGATION HELPER
  // ==========================================

  private navigateBack(tab: string) {
    this.router.navigate(
      ['/dashboard/Trade-Services/undertaking-issuance/inquiries-records'],
      {
        relativeTo: this.route,
        queryParamsHandling: 'merge',
        queryParams: { tab },
      },
    );
  }
}