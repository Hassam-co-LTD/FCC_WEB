import { OnInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { GeneralDetails } from './components/general-details/general-details';
import { ApplicantBeneficiary } from './components/applicant-beneficiary/applicant-beneficiary';
import { BankDetails } from './components/bank-details/bank-details';
import { InstructionsComponent } from './components/instructions/instructions';
import { Attachments } from './components/attachments/attachments';

import { Sidebar } from '../../../../core/sidebar/sidebar';

import {
  FormArray,
  FormBuilder,
  FormGroup
} from '@angular/forms';

import { ShippingGuaranteeTransaction } from '../../../../core/models/shipping-guarantee';

import { ApiService } from '../../../../core/services/api.service';

import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../../../core/services/auth.service';

import { ShippingGuaranteeFormTransactionService } from '../../../../core/services/user-service/shipping-guarantee-form-transaction-service/shipping-guarantee-form-transaction-service';

import { RejectDialogComponent } from '../../../../shared/reject-dialog/reject-dialog';

import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';


@Component({
  selector: 'app-shipping-guarantee',
  standalone: true,

  imports: [
    CommonModule,
    GeneralDetails,
    ApplicantBeneficiary,
    BankDetails,
    InstructionsComponent,
    MatDialogModule,
    Attachments,
    Sidebar
  ],

  templateUrl: './shipping-guarantee-screen.html',
  styleUrls: ['./shipping-guarantee-screen.scss']
})
export class ShippingGuarantee implements OnInit {

  // =========================================================
  // BASIC VARIABLES
  // =========================================================

  currentStep = 0;

  ShippingGuaranteeForm!: FormGroup;

  mode: 'CREATE' | 'UPDATE' | 'REJECTED' = 'CREATE';

  screenMode:
    'EDIT' |
    'SUBMITTED' |
    'APPROVED' |
    'FINAL' = 'EDIT';

  currentTx: ShippingGuaranteeTransaction =
    {} as ShippingGuaranteeTransaction;

  showUpdateSubmit = false;

  showApproveReject = false;

  rejectionReason = '';

  tnxId = '';

  companyId = '';


  // =========================================================
  // PERMISSIONS
  // =========================================================

  permissionNames: string[] = [];


  // =========================================================
  // SIDEBAR STEPS
  // =========================================================

  shippingGuaranteeSteps = [
    { label: 'General Details' },
    { label: 'Applicant & Beneficiary' },
    { label: 'Bank Details' },
    { label: 'Instructions' },
    { label: 'Attachments' }
  ];


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private fb: FormBuilder,

    private router: Router,

    private snackbar: MatSnackBar,

    private api: ApiService,

    private authservice: AuthService,

    private route: ActivatedRoute,

    private dialog: MatDialog,

    private transactionService:
      ShippingGuaranteeFormTransactionService
  ) {

    this.buildForm();

  }


  // =========================================================
  // LOAD PERMISSIONS
  // =========================================================

  private loadPermissions(): void {

    const storedPermissions =
      sessionStorage.getItem('permissionNames');

    if (storedPermissions) {

      try {

        this.permissionNames =
          JSON.parse(storedPermissions);

        console.log(
          'Shipping Guarantee Permission Names:',
          this.permissionNames
        );

      } catch (error) {

        console.error(
          'Error parsing permissionNames:',
          error
        );

        this.permissionNames = [];

      }

    } else {

      console.warn(
        'permissionNames not found in sessionStorage'
      );

      this.permissionNames = [];

    }

  }


  // =========================================================
  // CHECK PERMISSION
  // =========================================================

  hasPermission(permission: string): boolean {

    return this.permissionNames.some(
      p =>
        p?.trim().toLowerCase() ===
        permission.trim().toLowerCase()
    );

  }


  // =========================================================
  // ON INIT
  // =========================================================

  ngOnInit(): void {

    // -------------------------------------------------------
    // LOAD PERMISSIONS FIRST
    // -------------------------------------------------------

    this.loadPermissions();


    // -------------------------------------------------------
    // SCROLL / INTERSECTION OBSERVER
    // -------------------------------------------------------

    setTimeout(() => {

      const sections =
        document.querySelectorAll('section');

      const observer =
        new IntersectionObserver(

          entries => {

            entries.forEach(entry => {

              if (entry.isIntersecting) {

                this.currentStep =
                  Array.from(sections)
                    .indexOf(
                      entry.target as HTMLElement
                    );

              }

            });

          },

          {
            threshold: 0.4,
            root:
              document.querySelector('.scroll-area')
          }

        );

      sections.forEach(
        section =>
          observer.observe(section)
      );

    }, 200);


    // -------------------------------------------------------
    // NAVIGATION STATE
    // -------------------------------------------------------

    const navState = history.state;

    if (navState?.mode) {

      this.screenMode =
        navState.mode;

    }


    // -------------------------------------------------------
    // COMPANY ID
    // -------------------------------------------------------

    this.companyId =
      this.authservice.getCompanyId() || '';

    console.log(
      'Company ID from route:',
      this.companyId
    );


    // -------------------------------------------------------
    // TNX ID
    // -------------------------------------------------------

    this.tnxId =
      this.route.snapshot.paramMap.get(
        'tnxId'
      ) || '';

    console.log(
      'TNX ID from route:',
      this.tnxId
    );


    // -------------------------------------------------------
    // ROUTE PARAMETER
    // -------------------------------------------------------

    this.route.paramMap.subscribe(
      params => {

        const tnxId =
          params.get('tnxId');

        if (tnxId) {

          this.enterEditMode(tnxId);

        } else {

          this.enterCreateMode();

        }

      }
    );

  }


  // =========================================================
  // BUILD FORM
  // =========================================================


  // =========================================================
  // BUILD FORM
  // =========================================================

  private buildForm(): void {

    this.ShippingGuaranteeForm =
      this.fb.group({

        generalDetailsForm:
          this.fb.group({

            expiryDate: [''],

            beneficiaryReference: [''],

            customerReference: [''],

            billoflading: [''],

            modeOfShipment: [''],

            shippingDetails: [''],

            description: ['']

          }),


        applicantBeneficiaryForm:
          this.fb.group({

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

            beneficiaryCountry: ['']

          }),


        issuingbankForm:
          this.fb.group({

            bankName: [''],

            issuerReference: [''],

            currency: [''],

            amount: ['']

          }),


        instructionForm:
          this.fb.group({

            principalAccount: [''],

            feeAccount: [''],

            otherInstructions: ['']

          }),


        attachments:
          this.fb.array([])

      });

  }


  // =========================================================
  // CREATE MODE
  // =========================================================

  private enterCreateMode(): void {

    this.mode = 'CREATE';

    this.showUpdateSubmit = false;

    this.showApproveReject = false;

    this.currentTx =
      {} as ShippingGuaranteeTransaction;

    this.ShippingGuaranteeForm.reset();

    this.buildForm();

  }


  // =========================================================
  // EDIT MODE
  // =========================================================

  private enterEditMode(
    tnxId: string
  ): void {

    this.mode = 'UPDATE';

    this.api
      .getTransactionSgByTnxId(tnxId)
      .subscribe({

        next: tx => {

          this.currentTx = tx;

          this.patchForm(tx);


          switch (tx.status) {

            // ------------------------------------------------
            // PENDING
            // ------------------------------------------------

            case 'I':

              this.mode = 'UPDATE';

              this.screenMode = 'EDIT';

              this.ShippingGuaranteeForm.enable();

              break;


            // ------------------------------------------------
            // SUBMITTED
            // ------------------------------------------------

            case 'S':

              this.mode = 'UPDATE';

              this.screenMode = 'SUBMITTED';

              this.ShippingGuaranteeForm.disable();

              break;


            // ------------------------------------------------
            // APPROVED
            // ------------------------------------------------

            case 'A':

              this.mode = 'UPDATE';

              this.screenMode = 'APPROVED';

              this.ShippingGuaranteeForm.disable();

              break;


            // ------------------------------------------------
            // REJECTED
            // ------------------------------------------------

            case 'R':

              this.mode = 'REJECTED';

              this.screenMode = 'EDIT';

              this.ShippingGuaranteeForm.enable();

              break;


            // ------------------------------------------------
            // FINAL
            // ------------------------------------------------

            default:

              this.mode = 'UPDATE';

              this.screenMode = 'FINAL';

              this.ShippingGuaranteeForm.disable();

              break;

          }

        },

        error: () => {

          this.snackbar.open(
            'Transaction not found',
            'Close',
            {
              duration: 3000
            }
          );

          this.router.navigate([
            '/dashboard/Trade-Services/shipping-guarantee/inquiries-records'
          ]);

        }

      });

  }


  // =========================================================
  // FORM GETTERS
  // =========================================================

  get generalDetailsForm(): FormGroup {

    return this.ShippingGuaranteeForm.get(
      'generalDetailsForm'
    ) as FormGroup;

  }


  get applicantBeneficiaryForm(): FormGroup {

    return this.ShippingGuaranteeForm.get(
      'applicantBeneficiaryForm'
    ) as FormGroup;

  }


  get issuingbankForm(): FormGroup {

    return this.ShippingGuaranteeForm.get(
      'issuingbankForm'
    ) as FormGroup;

  }


  get instructionForm(): FormGroup {

    return this.ShippingGuaranteeForm.get(
      'instructionForm'
    ) as FormGroup;

  }


  get attachmentsArray(): FormArray {

    return this.ShippingGuaranteeForm.get(
      'attachments'
    ) as FormArray;

  }


  // =========================================================
  // PATCH FORM
  // =========================================================

  private patchForm(
    tx: ShippingGuaranteeTransaction
  ): void {

    this.ShippingGuaranteeForm.patchValue({

      generalDetailsForm: tx,

      applicantBeneficiaryForm: tx,

      issuingbankForm: tx,

      instructionForm: tx

    });

  }


  // =========================================================
  // SCROLL
  // =========================================================

  scrollToSection(
    index: number
  ): void {

    this.currentStep = index;

    const section =
      document.getElementById(
        `section-${index}`
      );

    section?.scrollIntoView({

      behavior: 'smooth',

      block: 'start'

    });

  }


  // =========================================================
  // FLATTEN FORM
  // =========================================================

  private flattenForm():
    ShippingGuaranteeTransaction {

    return {

      companyId:
        this.companyId,

      ...this.ShippingGuaranteeForm.value
        .generalDetailsForm,

      ...this.ShippingGuaranteeForm.value
        .applicantBeneficiaryForm,

      ...this.ShippingGuaranteeForm.value
        .issuingbankForm,

      ...this.ShippingGuaranteeForm.value
        .instructionForm,

      attachments:
        this.ShippingGuaranteeForm.value
          .attachments

    };

  }


  // =========================================================
  // SAVE
  // Permission: SG_CreateSave
  // =========================================================

  saveForm(): void {

    // -------------------------------------------------------
    // PERMISSION CHECK
    // -------------------------------------------------------

    if (
      !this.hasPermission(
        'SG_CreateSave'
      )
    ) {

      this.snackbar.open(
        'You do not have permission to create a Shipping Guarantee.',
        'Close',
        {
          duration: 3000
        }
      );

      return;

    }


    // -------------------------------------------------------
    // FORM VALIDATION
    // -------------------------------------------------------

    if (
      this.ShippingGuaranteeForm.invalid
    ) {

      this.ShippingGuaranteeForm
        .markAllAsTouched();

      this.snackbar.open(
        'Please complete all required fields before saving.',
        'Close',
        {
          duration: 3000
        }
      );

      return;

    }


    // -------------------------------------------------------
    // PAYLOAD
    // -------------------------------------------------------

    const payload =
      this.flattenForm();

    console.log(
      'Payload before saving draft:',
      payload
    );


    // -------------------------------------------------------
    // API
    // -------------------------------------------------------

    this.api
      .savePendingSg(payload)
      .subscribe({

        next:
          (res: ShippingGuaranteeTransaction) => {

            this.snackbar.open(
              `Draft saved successfully (TNX ID: ${res.tnxId})`,
              'Close',
              {
                duration: 5000
              }
            );

            setTimeout(

              () =>
                this.router.navigate([
                  '/dashboard/Trade-Services/shipping-guarantee/inquiries-records'
                ]),

              50

            );

          },

        error: () => {

          this.snackbar.open(
            'Error saving draft',
            'Close',
            {
              duration: 3000
            }
          );

        }

      });

  }


  // =========================================================
  // SUBMIT
  // Permission: SG_InquirySubmit
  // =========================================================

  submitGuarantee(): void {

    // -------------------------------------------------------
    // PERMISSION CHECK
    // -------------------------------------------------------

    if (
      !this.hasPermission(
        'SG_InquirySubmit'
      )
    ) {

      this.snackbar.open(
        'You do not have permission to submit this transaction.',
        'Close',
        {
          duration: 3000
        }
      );

      return;

    }


    const tnxId =
      this.currentTx?.tnxId;

    const companyId =
      this.currentTx?.companyId;


    // -------------------------------------------------------
    // TNX ID CHECK
    // -------------------------------------------------------

    if (!tnxId) {

      this.snackbar.open(
        'Transaction ID not found. Please save the draft first.',
        'Close',
        {
          duration: 3000
        }
      );

      return;

    }


    // -------------------------------------------------------
    // COMPANY ID CHECK
    // -------------------------------------------------------

    if (!companyId) {

      this.snackbar.open(
        'Company ID not found. Please save the draft first.',
        'Close',
        {
          duration: 3000
        }
      );

      return;

    }


    // -------------------------------------------------------
    // PAYLOAD
    // -------------------------------------------------------

    const payload = {

      ...this.flattenForm(),

      event: 'CRE',

      tnxId: this.tnxId

    };


    // -------------------------------------------------------
    // API
    // -------------------------------------------------------

    this.api
      .submitSgByTnxId(
        tnxId,
        payload
      )
      .subscribe({

        next:
          (res: ShippingGuaranteeTransaction) => {

            this.transactionService
              .addOrUpdateTransaction(res);

            this.router.navigate(
              [
                '/dashboard/Trade-Services/shipping-guarantee/success'
              ],
              {

                state: {

                  source:
                    'SHIPPING_GUARANTEE',

                  transaction:
                    res

                }

              }
            );

          },

        error: () => {

          this.snackbar.open(
            'Error submitting transaction',
            'Close',
            {
              duration: 3000
            }
          );

        }

      });

  }


  // =========================================================
  // BACK
  // =========================================================

  back(): void {

    this.router.navigate([
      '/dashboard'
    ]);

  }


  // =========================================================
  // ATTACHMENTS
  // =========================================================

  updateAttachments(
    files: File[]
  ): void {

    const arr =
      this.ShippingGuaranteeForm.get(
        'attachments'
      ) as FormArray;

    arr.clear();


    files.forEach(file => {

      arr.push(

        this.fb.group({

          title:
            file.name.replace(
              /\.[^/.]+$/,
              ''
            ),

          fileName:
            file.name,

          size:
            file.size,

          type:
            file.type,

          file:
            file

        })

      );

    });

  }


  // =========================================================
  // UPDATE / AMEND
  // Permission: SG_InquiryPendingUpdate
  // =========================================================

  update(): void {

    // -------------------------------------------------------
    // PERMISSION CHECK
    // -------------------------------------------------------

    if (
      !this.hasPermission(
        'SG_InquiryPendingUpdate'
      )
    ) {

      this.snackbar.open(
        'You do not have permission to amend this transaction.',
        'Close',
        {
          duration: 3000
        }
      );

      return;

    }


    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (
      this.ShippingGuaranteeForm.invalid ||
      !this.currentTx?.tnxId
    ) {

      this.snackbar.open(
        'Invalid form or missing transaction ID',
        'Close',
        {
          duration: 3000
        }
      );

      return;

    }


    // -------------------------------------------------------
    // PAYLOAD
    // -------------------------------------------------------

    const payload =
      this.flattenForm();

    payload.tnxId =
      this.tnxId;

    console.log(
      'Payload before update:',
      payload
    );


    if (!payload.tnxId) {

      console.error(
        'TNX ID is missing!'
      );

      return;

    }


    // -------------------------------------------------------
    // API
    // -------------------------------------------------------

    this.api
      .updatePendingByTnxIdSg(
        payload.tnxId!,
        payload
      )
      .subscribe({

        next: res => {

          this.snackbar.open(
            `Data successfully updated (${res.tnxId})`,
            'Close',
            {
              duration: 3000
            }
          );

          setTimeout(

            () =>
              this.router.navigate([
                '/dashboard/Trade-Services/shipping-guarantee/inquiries-records'
              ]),

            300

          );

        },

        error: () => {

          this.snackbar.open(
            'Error updating transaction',
            'Close',
            {
              duration: 3000
            }
          );

        }

      });

  }


  // =========================================================
  // APPROVE
  // Permission: SG_InquiryApprove
  // =========================================================

  approve(): void {

    // -------------------------------------------------------
    // PERMISSION CHECK
    // -------------------------------------------------------

    if (
      !this.hasPermission(
        'SG_InquiryApprove'
      )
    ) {

      this.snackbar.open(
        'You do not have permission to approve this transaction.',
        'Close',
        {
          duration: 3000
        }
      );

      return;

    }


    // -------------------------------------------------------
    // API
    // -------------------------------------------------------

    this.api
      .approveTransactionSg(
        this.currentTx.tnxId!,
        this.currentTx
      )
      .subscribe({

        next: () =>
          this.navigateBack(
            'approved'
          ),

        error: () =>
          this.snackbar.open(
            'Approval failed',
            'Close',
            {
              duration: 3000
            }
          )

      });

  }


  // =========================================================
  // REJECT
  // Permission: SG_InquiryReject
  // =========================================================

  openReject(): void {

    // -------------------------------------------------------
    // PERMISSION CHECK
    // -------------------------------------------------------

    if (
      !this.hasPermission(
        'SG_InquiryReject'
      )
    ) {

      this.snackbar.open(
        'You do not have permission to reject this transaction.',
        'Close',
        {
          duration: 3000
        }
      );

      return;

    }


    // -------------------------------------------------------
    // OPEN REJECT DIALOG
    // -------------------------------------------------------

    const dialogRef =
      this.dialog.open(
        RejectDialogComponent,
        {
          width: '400px'
        }
      );


    dialogRef
      .afterClosed()
      .subscribe(
        (
          reason:
            string | undefined
        ) => {

          if (!reason) {
            return;
          }


          // -------------------------------------------------
          // REJECT API
          // -------------------------------------------------

          this.api
            .rejectTransactionSg(
              this.currentTx.tnxId!,
              reason
            )
            .subscribe({

              next: () => {

                this.snackbar.open(
                  'Transaction rejected successfully',
                  'Close',
                  {
                    duration: 3000
                  }
                );

                this.navigateBack(
                  'rejected'
                );

              },

              error: () => {

                this.snackbar.open(
                  'Failed to reject transaction',
                  'Close',
                  {
                    duration: 3000
                  }
                );

              }

            });

        }
      );

  }


  // =========================================================
  // NAVIGATE BACK
  // =========================================================

  private navigateBack(
    tab: string
  ): void {

    this.router.navigate(
      [
        '/dashboard/Trade-Services/shipping-guarantee/inquiries-records'
      ],
      {

        relativeTo:
          this.route,

        queryParamsHandling:
          'merge',

        queryParams: {
          tab
        }

      }
    );

  }


  // =========================================================
  // UPDATE REJECTED
  // Permission: SG_InquiryRejectUpdate
  // =========================================================


  // =========================================================
  // UPDATE REJECTED
  // Permission: SG_InquiryRejectUpdate
  // =========================================================

  updateRejected(): void {

    // -------------------------------------------------------
    // PERMISSION CHECK
    // -------------------------------------------------------

    if (
      !this.hasPermission(
        'SG_InquiryRejectUpdate'
      )
    ) {

      this.snackbar.open(
        'You do not have permission to amend this rejected transaction.',
        'Close',
        {
          duration: 3000
        }
      );

      return;

    }


    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (
      this.ShippingGuaranteeForm.invalid ||
      !this.currentTx?.tnxId
    ) {

      this.snackbar.open(
        'Invalid form or missing transaction ID',
        'Close',
        {
          duration: 3000
        }
      );

      return;

    }


    // -------------------------------------------------------
    // PAYLOAD
    // -------------------------------------------------------

    const payload =
      this.flattenForm();

    payload.tnxId =
      this.currentTx.tnxId;


    // -------------------------------------------------------
    // API
    // -------------------------------------------------------

    this.api
      .updateRejectedTransactionSg(
        payload.tnxId,
        payload
      )
      .subscribe({

        next: res => {

          this.snackbar.open(
            `Rejected transaction updated and moved back to Pending (TNX: ${res.tnxId})`,
            'Close',
            {
              duration: 3000
            }
          );


          this.router.navigate(
            [
              '/dashboard/Trade-Services/shipping-guarantee/inquiries-records'
            ],
            {

              queryParams: {
                tab: 'pending'
              }

            }
          );

        },

        error: () => {

          this.snackbar.open(
            'Failed to update rejected transaction',
            'Close',
            {
              duration: 3000
            }
          );

        }

      });

  }

}