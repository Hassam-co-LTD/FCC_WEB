import { Component, OnInit } from '@angular/core';

import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators
} from '@angular/forms';

import { ReactiveFormsModule } from '@angular/forms';

import {
  Router,
  RouterOutlet,
  ActivatedRoute
} from '@angular/router';

import { CommonModule } from '@angular/common';

import { MatSnackBar } from '@angular/material/snack-bar';

import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

import { MatIconModule } from '@angular/material/icon';

import { GeneralDetails } from './components/general-details/general-details';
import { ApplicantBeneficiary } from './components/applicant-beneficiary/applicant-beneficiary';
import { BankDetails } from './components/bank-details/bank-details';
import { AmountChargeDetails } from './components/amount-charge-details/amount-charge-details';
import { PaymentDetails } from './components/payment-details/payment-details';
import { ShipmentDetails } from './components/shipment-details/shipment-details';
import { NarrativeDetails } from './components/narrative-details/narrative-details';
import { Licenses } from './components/licenses/licenses';
import { InstructionToBank } from './components/instruction-to-bank/instruction-to-bank';
import { Attachments } from './components/attachments/attachments';

import { Sidebar } from '../../../../core/sidebar/sidebar';

import { ApiService } from '../../../../core/services/api.service';

import { ImportLcTransaction } from '../../../../core/models/import-lc';

import { ImportlcFormTransactionService } from '../../../../core/services/user-service/importlc-form-transaction-service/importlc-form-transaction-service';

import { RejectDialogComponent } from '../../../../shared/reject-dialog/reject-dialog';

import { AuthService } from '../../../../core/services/auth.service';


@Component({
  selector: 'app-import-lc',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    GeneralDetails,
    ApplicantBeneficiary,
    BankDetails,
    AmountChargeDetails,
    PaymentDetails,
    ShipmentDetails,
    NarrativeDetails,
    Licenses,
    InstructionToBank,
    Attachments,

    MatDialogModule,
    Sidebar,
    RouterOutlet,
    MatIconModule,

    Sidebar
  ],

  templateUrl: './import-screen.html',
  styleUrls: ['./import-screen.scss']
})


export class ImportScreen implements OnInit {

  // ============================================================
  // FORM STATE
  // ============================================================

  currentStep = 0;

  importForm!: FormGroup;

  mode: 'CREATE' | 'UPDATE' | 'REJECTED' = 'CREATE';

  screenMode:
    | 'EDIT'
    | 'SUBMITTED'
    | 'APPROVED'
    | 'FINAL' = 'EDIT';

  currentTx: ImportLcTransaction =
    {} as ImportLcTransaction;

  showUpdateSubmit = false;

  showApproveReject = false;

  rejectionReason = '';

  tnxId = '';

  companyId = '';


  // ============================================================
  // PERMISSIONS
  // ============================================================

  permissionNames: string[] = [];


  // ============================================================
  // IMPORT LC FORM STEPS
  // ============================================================

  importSteps = [
    { label: 'General Details' },
    { label: 'Applicant Details' },
    { label: 'Bank Details' },
    { label: 'Amount & Charges' },
    { label: 'Payment Details' },
    { label: 'Shipment Details' },
    { label: 'Narrative Details' },
    { label: 'Licenses' },
    { label: 'Instructions to Bank' },
    { label: 'Attachments' }
  ];


  // ============================================================
  // INQUIRY SCREEN STATE
  // ============================================================

  activeTab:
    | 'live'
    | 'pending'
    | 'submitted'
    | 'approved'
    | 'rejected' = 'live';

  searchQuery = '';

  currencyFilter = '';

  showAdvanced = false;


  tabs = [
    {
      key: 'live' as const,
      label: 'Live'
    },

    {
      key: 'pending' as const,
      label: 'Pending'
    },

    {
      key: 'submitted' as const,
      label: 'Submitted'
    },

    {
      key: 'approved' as const,
      label: 'Approved'
    },

    {
      key: 'rejected' as const,
      label: 'Rejected'
    }
  ];


  transactions: ImportLcTransaction[] = [];

  filteredTransactions: ImportLcTransaction[] = [];

  pagedTransactions: ImportLcTransaction[] = [];


  // ============================================================
  // PAGINATION
  // ============================================================

  currentPage = 1;

  pageSize = 10;

  totalPages = 1;


  // ============================================================
  // SORTING
  // ============================================================

  sortColumn = '';

  sortDirection: 'asc' | 'desc' = 'asc';


  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private fb: FormBuilder,

    private router: Router,

    private snackBar: MatSnackBar,

    private api: ApiService,

    private route: ActivatedRoute,

    private dialog: MatDialog,

    private transactionService:
      ImportlcFormTransactionService,

    private authservice: AuthService
  ) {

    this.buildForm();
  }


  // ============================================================
  // ON INIT
  // ============================================================

  ngOnInit(): void {

    // ----------------------------------------------------------
    // LOAD PERMISSIONS
    // ----------------------------------------------------------

    this.loadPermissions();


    // ----------------------------------------------------------
    // SCROLL LOGIC
    // ----------------------------------------------------------

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
              document.querySelector(
                '.scroll-area'
              )
          }
        );


      sections.forEach(section =>
        observer.observe(section)
      );

    }, 200);


    // ----------------------------------------------------------
    // ROUTE STATE
    // ----------------------------------------------------------

    const navState = history.state;

    if (navState?.mode) {

      this.screenMode =
        navState.mode;
    }


    // ----------------------------------------------------------
    // COMPANY
    // ----------------------------------------------------------

    this.companyId =
      this.authservice.getCompanyId() || '';

    console.log(
      'Company ID:',
      this.companyId
    );


    // ----------------------------------------------------------
    // TNX ID
    // ----------------------------------------------------------

    this.tnxId =
      this.route.snapshot.paramMap
        .get('tnxId') || '';

    console.log(
      'TNX ID:',
      this.tnxId
    );


    // ----------------------------------------------------------
    // ROUTE PARAMETER
    // ----------------------------------------------------------

    this.route.paramMap.subscribe(params => {

      const tnxId =
        params.get('tnxId');

      if (tnxId) {

        this.enterEditMode(tnxId);

      } else {

        this.enterCreateMode();
      }

    });

  }


  // ============================================================
  // LOAD PERMISSIONS
  // ============================================================

  private loadPermissions(): void {

    const storedPermissions =
      sessionStorage.getItem(
        'permissionNames'
      );


    if (storedPermissions) {

      try {

        this.permissionNames =
          JSON.parse(
            storedPermissions
          );

        console.log(
          'Import LC Permission Names:',
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


  // ============================================================
  // CHECK PERMISSION
  // ============================================================

  hasPermission(
    permission: string
  ): boolean {

    return this.permissionNames.some(
      p =>
        p?.trim().toLowerCase() ===
        permission.trim().toLowerCase()
    );

  }


  // ============================================================
  // BUILD FORM
  // ============================================================

  private buildForm(): void {

    this.importForm =
      this.fb.group({

        generalDetails:
          this.fb.group({

            productType:
              ['backtoback'],

            modeOfTransmission:
              ['SWIFT'],

            expiryDate:
              [''],

            placeOfExpiry:
              ['beneficiary'],

            featureIrrevocable:
              [false],

            featureRevolving:
              [false],

            featureTransferable:
              [false],

            applicableRules:
              ['EUCP'],

            confirmationInstruction:
              ['confirm']
          }),


        applicantForm:
          this.fb.group({

            applicantName:
              [''],

            applicantAddress1:
              [''],

            applicantAddress2:
              [''],

            applicantAddress3:
              [''],

            applicantAddress4:
              [''],

            applicantCountry:
              [''],

            beneficiaryName:
              [''],

            beneficiaryAddress1:
              [''],

            beneficiaryAddress2:
              [''],

            beneficiaryAddress3:
              [''],

            beneficiaryAddress4:
              [''],

            beneficiaryCountry:
              ['']
          }),


        bankForm:
          this.fb.group({

            issuingBankName:
              [''],

            issuerReference:
              [''],

            advisingBankName:
              [''],

            adviseThroughBankName:
              ['']
          }),


        amountChargeForm:
          this.fb.group({

            currency:
              [''],

            amount: [
              '',
              Validators.pattern(
                /^[0-9]+(\.[0-9]{1,2})?$/
              )
            ],

            variationType:
              ['percent'],

            variationPlus:
              [''],

            variationMinus:
              [''],

            issuingBankCharges:
              ['Applicant'],

            outsideCountryCharges:
              ['Beneficiary'],

            additionalAmount:
              ['']
          }),


        paymentDetailsForm:
          this.fb.group({

            creditAvailableWith:
              [''],

            bankName:
              [''],

            creditAvailableBy:
              ['Payment'],

            paymentDraftAt:
              ['Sight']
          }),


        shipmentForm:
          this.fb.group({

            shipmentFrom:
              [''],

            shipmentTo:
              [''],

            placeOfLoading:
              [''],

            placeOfDischarge:
              [''],

            lastShipmentDate:
              [''],

            shipmentPeriodNarrative:
              [''],

            partialShipment:
              ['Allowed'],

            transhipment:
              ['Not Allowed']
          }),


        narrativeForm:
          this.fb.group({

            descriptionOfGoods:
              [''],

            documentsRequired:
              [''],

            additionalInstructions:
              [''],

            otherDetails:
              ['']
          }),


        instructionForm:
          this.fb.group({

            principalAccount:
              [''],

            feeAccount:
              [''],

            otherInstructions:
              ['']
          }),


        attachments:
          this.fb.array([])
      });

  }


  // ============================================================
  // CREATE MODE
  // ============================================================


  // ============================================================
  // CREATE MODE
  // ============================================================

  private enterCreateMode(): void {

    this.mode = 'CREATE';

    this.screenMode = 'EDIT';

    this.showUpdateSubmit = false;

    this.showApproveReject = false;

    this.currentTx =
      {} as ImportLcTransaction;

    this.buildForm();

  }


  // ============================================================
  // EDIT MODE
  // ============================================================

  private enterEditMode(
    tnxId: string
  ): void {

    this.mode = 'UPDATE';


    this.api
      .getTransactionByTnxId(tnxId)
      .subscribe({

        next: tx => {

          this.currentTx = tx;

          this.patchForm(tx);


          switch (tx.status) {

            case 'I':

              this.mode = 'UPDATE';

              this.screenMode = 'EDIT';

              this.importForm.enable();

              break;


            case 'S':

              this.mode = 'UPDATE';

              this.screenMode =
                'SUBMITTED';

              this.importForm.disable();

              break;


            case 'A':

              this.mode = 'UPDATE';

              this.screenMode =
                'APPROVED';

              this.importForm.disable();

              break;


            case 'R':

              this.mode = 'REJECTED';

              this.screenMode = 'EDIT';

              this.importForm.enable();

              break;


            default:

              this.mode = 'UPDATE';

              this.screenMode = 'FINAL';

              this.importForm.disable();

              break;
          }

        },


        error: () => {

          this.snackBar.open(
            'Transaction not found',
            'Close',
            {
              duration: 3000
            }
          );


          this.router.navigate([
            '/dashboard/Trade-Services/import-screen/inquiries'
          ]);

        }

      });

  }


  // ============================================================
  // FORM GETTERS
  // ============================================================

  get generalDetailsForm(): FormGroup {

    return this.importForm.get(
      'generalDetails'
    ) as FormGroup;

  }


  get applicantForm(): FormGroup {

    return this.importForm.get(
      'applicantForm'
    ) as FormGroup;

  }


  get bankForm(): FormGroup {

    return this.importForm.get(
      'bankForm'
    ) as FormGroup;

  }


  get amountChargeForm(): FormGroup {

    return this.importForm.get(
      'amountChargeForm'
    ) as FormGroup;

  }


  get paymentDetailsForm(): FormGroup {

    return this.importForm.get(
      'paymentDetailsForm'
    ) as FormGroup;

  }


  get shipmentForm(): FormGroup {

    return this.importForm.get(
      'shipmentForm'
    ) as FormGroup;

  }


  get narrativeForm(): FormGroup {

    return this.importForm.get(
      'narrativeForm'
    ) as FormGroup;

  }


  get instructionForm(): FormGroup {

    return this.importForm.get(
      'instructionForm'
    ) as FormGroup;

  }


  get attachmentsArray(): FormArray {

    return this.importForm.get(
      'attachments'
    ) as FormArray;

  }


  // ============================================================
  // PATCH FORM
  // ============================================================

  private patchForm(
    tx: ImportLcTransaction
  ): void {

    this.importForm.patchValue({

      generalDetails: tx,

      applicantForm: tx,

      bankForm: tx,

      amountChargeForm: tx,

      paymentDetailsForm: tx,

      shipmentForm: tx,

      narrativeForm: tx,

      instructionForm: tx
    });

  }


  // ============================================================
  // SCROLL
  // ============================================================

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


  // ============================================================
  // FLATTEN FORM
  // ============================================================

  private flattenForm():
    ImportLcTransaction {

    return {

      companyId:
        this.companyId,

      ...this.importForm.value
        .generalDetails,

      ...this.importForm.value
        .applicantForm,

      ...this.importForm.value
        .bankForm,

      ...this.importForm.value
        .amountChargeForm,

      ...this.importForm.value
        .paymentDetailsForm,

      ...this.importForm.value
        .shipmentForm,

      ...this.importForm.value
        .narrativeForm,

      ...this.importForm.value
        .instructionForm,

      attachments:
        this.importForm.value
          .attachments
    };

  }


  // ============================================================
  // CREATE / SAVE
  // Permission: ILC_CreateSave
  // ============================================================

  saveForm(): void {

    if (
      !this.hasPermission(
        'ILC_CreateSave'
      )
    ) {

      this.snackBar.open(
        'You do not have permission to create an Import LC.',
        'Close',
        {
          duration: 3000
        }
      );

      return;
    }


    if (this.importForm.invalid) {

      this.importForm
        .markAllAsTouched();

      this.snackBar.open(
        'Please complete all required fields before saving.',
        'Close',
        {
          duration: 3000
        }
      );

      return;
    }


    const payload =
      this.flattenForm();


    console.log(
      'Payload before saving draft:',
      payload
    );


    this.api
      .savePending(payload)
      .subscribe({

        next:
          (res: ImportLcTransaction) => {

            this.snackBar.open(
              `Draft saved successfully (TNX ID: ${res.tnxId})`,
              'Close',
              {
                duration: 5000
              }
            );


            setTimeout(() => {

              this.router.navigate([
                '/dashboard/Trade-Services/import-screen/inquiries'
              ]);

            }, 50);

          },


        error: () => {

          this.snackBar.open(
            'Error saving draft',
            'Close',
            {
              duration: 3000
            }
          );

        }

      });

  }


  // ============================================================
  // SUBMIT
  // Permission: ILC_InquirySubmit
  // ============================================================

  submitLc(): void {

    if (
      !this.hasPermission(
        'ILC_InquirySubmit'
      )
    ) {

      this.snackBar.open(
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


    if (!tnxId) {

      this.snackBar.open(
        'Transaction ID not found. Please save the draft first.',
        'Close',
        {
          duration: 3000
        }
      );

      return;
    }


    if (!companyId) {

      this.snackBar.open(
        'Company ID not found. Please save the draft first.',
        'Close',
        {
          duration: 3000
        }
      );

      return;
    }


    const payload = {

      ...this.flattenForm(),

      event: 'CRE',

      tnxId: this.tnxId
    };


    this.api
      .submitTransaction(
        tnxId,
        payload
      )
      .subscribe({

        next:
          (res: ImportLcTransaction) => {

            this.transactionService
              .addOrUpdateTransaction(res);


            this.router.navigate([
              '/dashboard/Trade-Services/import-screen/success'
            ], {

              state: {

                source: 'IMPORT_LC',

                transaction: res
              }

            });

          },


        error: () => {

          this.snackBar.open(
            'Error submitting transaction',
            'Close',
            {
              duration: 3000
            }
          );

        }

      });

  }


  // ============================================================
  // BACK
  // ============================================================

  back(): void {

    this.router.navigate([
      '/dashboard'
    ]);

  }


  // ============================================================
  // ATTACHMENTS
  // ============================================================

  updateAttachments(
    files: File[]
  ): void {

    const arr =
      this.importForm.get(
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


  // ============================================================
  // UPDATE / AMEND
  // Permission: ILC_InquiryPendingUpdate
  // ============================================================

  update(): void {

    if (
      !this.hasPermission(
        'ILC_InquiryPendingUpdate'
      )
    ) {

      this.snackBar.open(
        'You do not have permission to amend this transaction.',
        'Close',
        {
          duration: 3000
        }
      );

      return;
    }


    if (
      this.importForm.invalid ||
      !this.currentTx?.tnxId
    ) {

      this.snackBar.open(
        'Invalid form or missing transaction ID',
        'Close',
        {
          duration: 3000
        }
      );

      return;
    }


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


    this.api
      .updatePendingByTnxId(payload)
      .subscribe({

        next: res => {

          this.snackBar.open(
            `Data successfully updated (${res.tnxId})`,
            'Close',
            {
              duration: 3000
            }
          );


          setTimeout(() => {

            this.router.navigate([
              '/dashboard/Trade-Services/import-screen/inquiries'
            ]);

          }, 300);

        },


        error: () => {

          this.snackBar.open(
            'Error updating transaction',
            'Close',
            {
              duration: 3000
            }
          );

        }

      });

  }


  // ============================================================
  // APPROVE
  // Permission: ILC_InquiryApprove
  // ============================================================


  // ============================================================
  // APPROVE
  // Permission: ILC_InquiryApprove
  // ============================================================

  approve(): void {

    if (
      !this.hasPermission(
        'ILC_InquiryApprove'
      )
    ) {

      this.snackBar.open(
        'You do not have permission to approve this transaction.',
        'Close',
        {
          duration: 3000
        }
      );

      return;
    }


    this.api
      .approveTransaction(
        this.currentTx.tnxId!,
        this.currentTx
      )
      .subscribe({

        next: () => {

          this.navigateBack(
            'approved'
          );

        },


        error: () => {

          this.snackBar.open(
            'Approval failed',
            'Close',
            {
              duration: 3000
            }
          );

        }

      });

  }


  // ============================================================
  // REJECT
  // Permission: ILC_InquiryReject
  // ============================================================

  openReject(): void {

    if (
      !this.hasPermission(
        'ILC_InquiryReject'
      )
    ) {

      this.snackBar.open(
        'You do not have permission to reject this transaction.',
        'Close',
        {
          duration: 3000
        }
      );

      return;
    }


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


          this.api
            .rejectTransaction(
              this.currentTx.tnxId!,
              reason
            )
            .subscribe({

              next: () => {

                this.snackBar.open(
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

                this.snackBar.open(
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


  // ============================================================
  // NAVIGATE BACK
  // ============================================================

  private navigateBack(
    tab: string
  ): void {

    this.router.navigate([
      '/dashboard/Trade-Services/import-screen/inquiries'
    ], {

      relativeTo: this.route,

      queryParamsHandling: 'merge',

      queryParams: {
        tab
      }

    });

  }


  // ============================================================
  // UPDATE REJECTED
  // Permission: ILC_InquiryRejectUpdate
  // ============================================================

  updateRejected(): void {

    if (
      !this.hasPermission(
        'ILC_InquiryRejectUpdate'
      )
    ) {

      this.snackBar.open(
        'You do not have permission to amend this transaction.',
        'Close',
        {
          duration: 3000
        }
      );

      return;
    }


    if (
      this.importForm.invalid ||
      !this.currentTx?.tnxId
    ) {

      this.snackBar.open(
        'Invalid form or missing transaction ID',
        'Close',
        {
          duration: 3000
        }
      );

      return;
    }


    const payload =
      this.flattenForm();


    payload.tnxId =
      this.currentTx.tnxId;


    this.api
      .updateRejectedTransaction(
        payload.tnxId,
        payload
      )
      .subscribe({

        next: res => {

          this.snackBar.open(
            `Rejected transaction updated and moved back to Pending (TNX: ${res.tnxId})`,
            'Close',
            {
              duration: 3000
            }
          );


          this.router.navigate([
            '/dashboard/Trade-Services/import-screen/inquiries'
          ], {
            queryParams: {
              tab: 'pending'
            }
          });

        },


        error: () => {

          this.snackBar.open(
            'Failed to update rejected transaction',
            'Close',
            {
              duration: 3000
            }
          );

        }

      });

  }


  // ============================================================
  // INQUIRY TAB
  // ============================================================

  setActiveTab(
    tab:
      | 'live'
      | 'pending'
      | 'submitted'
      | 'approved'
      | 'rejected'
  ): void {

    this.activeTab = tab;

    this.currentPage = 1;

    this.applyFilters();

  }


  // ============================================================
  // SEARCH / FILTER
  // ============================================================

  applyFilters(): void {

    let result =
      [...this.transactions];


    const search =
      this.searchQuery
        .trim()
        .toLowerCase();


    if (search) {

      result =
        result.filter(tx => {

          return (

            String(
              tx.tnxId ?? ''
            )
              .toLowerCase()
              .includes(search)

            ||

            String(
              tx.beneficiaryName ?? ''
            )
              .toLowerCase()
              .includes(search)

            ||

            String(
              tx.issuingBankName ?? ''
            )
              .toLowerCase()
              .includes(search)

            ||

            String(
              tx.currency ?? ''
            )
              .toLowerCase()
              .includes(search)

          );

        });

    }


    const currency =
      this.currencyFilter
        .trim()
        .toLowerCase();


    if (currency) {

      result =
        result.filter(tx =>
          String(
            tx.currency ?? ''
          )
            .toLowerCase()
            .includes(currency)
        );

    }


    result =
      result.filter(tx => {

        const status =
          String(
            tx.status ?? ''
          )
            .toUpperCase();


        switch (
          this.activeTab
        ) {

          case 'pending':
            return status === 'I';

          case 'submitted':
            return status === 'S';

          case 'approved':
            return status === 'A';

          case 'rejected':
            return status === 'R';

          case 'live':
            return true;

          default:
            return true;
        }

      });


    this.filteredTransactions =
      result;


    this.updatePagination();

  }


  // ============================================================
  // CLEAR SEARCH
  // ============================================================

  clearSearch(): void {

    this.searchQuery = '';

    this.applyFilters();

  }


  // ============================================================
  // PAGINATION
  // ============================================================

  private updatePagination(): void {

    this.totalPages =
      Math.max(
        1,
        Math.ceil(
          this.filteredTransactions.length /
          this.pageSize
        )
      );


    if (
      this.currentPage >
      this.totalPages
    ) {

      this.currentPage =
        this.totalPages;

    }


    const start =
      (this.currentPage - 1) *
      this.pageSize;


    const end =
      start + this.pageSize;


    this.pagedTransactions =
      this.filteredTransactions.slice(
        start,
        end
      );

  }


  previousPage(): void {

    if (this.currentPage > 1) {

      this.currentPage--;

      this.updatePagination();

    }

  }


  nextPage(): void {

    if (
      this.currentPage <
      this.totalPages
    ) {

      this.currentPage++;

      this.updatePagination();

    }

  }


  // ============================================================
  // SORT
  // ============================================================

  sortBy(
    column: string
  ): void {

    if (
      this.sortColumn === column
    ) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    } else {

      this.sortColumn =
        column;

      this.sortDirection =
        'asc';

    }


    this.filteredTransactions.sort(
      (a: any, b: any) => {

        const valueA =
          a?.[column];

        const valueB =
          b?.[column];


        if (
          valueA == null &&
          valueB == null
        ) {
          return 0;
        }


        if (valueA == null) {
          return 1;
        }


        if (valueB == null) {
          return -1;
        }


        const comparison =
          String(valueA)
            .localeCompare(
              String(valueB),
              undefined,
              {
                numeric: true,
                sensitivity: 'base'
              }
            );


        return this.sortDirection === 'asc'
          ? comparison
          : -comparison;

      }
    );


    this.updatePagination();

  }


  // ============================================================
  // TRACK BY
  // ============================================================

  trackByTnxId(
    index: number,
    tx: ImportLcTransaction
  ): string | number {

    return tx.tnxId || index;

  }


  // ============================================================
  // OPEN IMPORT LC
  // ============================================================

  openImportLc(
    tx: ImportLcTransaction
  ): void {

    if (!tx?.tnxId) {

      console.warn(
        'Transaction does not contain TNX ID:',
        tx
      );

      return;
    }


    this.router.navigate([
      '/dashboard/Trade-Services/import-screen',
      tx.tnxId
    ]);

  }


  // ============================================================
  // VIEW TRANSACTION
  // ============================================================

  viewTransaction(
    tx: ImportLcTransaction
  ): void {

    this.openImportLc(tx);

  }

}