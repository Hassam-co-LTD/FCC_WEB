
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
import { ImportLcTransaction } from '../../../../../../../core/models/import-lc';
import { ApiService } from '../../../../../../../core/services/api.service';
import { Sidebar } from '../../../../../../../core/sidebar/sidebar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Attachments } from './components/attachments/attachments';
import { Upload } from './components/upload/upload';
import { GeneralDetails } from './components/general-details/general-details';
import { RejectDialogComponent } from '../../../../../../../shared/reject-dialog/reject-dialog';
import { finalize } from 'rxjs';
import { TransactionComparisonService } from '../../../../../../../core/services/admin-service/transaction-comparison.service';

@Component({
  selector: 'app-amend-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GeneralDetails,
    Upload,
    Attachments,
    MatDialogModule,
    Sidebar,
    RouterOutlet,
  ],
  templateUrl: './amend.html',
  styleUrls: ['./amend.scss'],
})
export class AmendScreen implements OnInit {

  currentStep = 0;
  importForm!: FormGroup;

  mode: 'CREATE' | 'UPDATE' | 'REJECTED' = 'CREATE';
  screenMode: 'EDIT' | 'SUBMITTED' | 'APPROVED' | 'FINAL' = 'EDIT';

  currentTx: ImportLcTransaction = {} as ImportLcTransaction;

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

  exportSteps = [
    { label: 'General Details' },
    { label: 'Upload MT700/MT701' },
    { label: 'Attachments' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private api: ApiService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private transactionComparisonService: TransactionComparisonService,
  ) {
    this.buildForm();
  }

  ngOnInit() {
    this.loadPermissions();
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

    const sessionData = JSON.parse(
      sessionStorage.getItem('userData') || '{}'
    );

    this.companyId = sessionData.companyId ?? '';

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

  private loadPermissions(): void {
    const storedPermissions = sessionStorage.getItem('permissionNames');

    if (storedPermissions) {
      try {
        this.permissionNames = JSON.parse(storedPermissions);

        console.log('Import LC Amend Permissions:', this.permissionNames);
      } catch (error) {
        console.error('Error parsing permissionNames:', error);

        this.permissionNames = [];
      }
    } else {
      console.warn('permissionNames not found in sessionStorage');

      this.permissionNames = [];
    }
  }

  // ============================================================
  // CHECK PERMISSION
  // ============================================================

  hasPermission(permission: string): boolean {
    return this.permissionNames.some(
      (p) => p?.trim().toLowerCase() === permission.trim().toLowerCase(),
    );
  }

  private buildForm(): void {

    this.importForm = this.fb.group({

      generalDetails: this.fb.group({
        customerRef: [''],
        advisingBank: ['', Validators.required],
        issuerRef: ['', Validators.required],
      }),

      appUpload: this.fb.group({
        file: [null],
      }),

      attachments: this.fb.array([]),
    });
  }

  private enterCreateMode(): void {
    this.mode = 'CREATE';
    this.showUpdateSubmit = false;
    this.showApproveReject = false;
    this.isHistoricalView = false;

    this.currentTx = {} as ImportLcTransaction;
    this.importForm.reset();
    this.buildForm();
  }

  // private enterEditMode(tnxId: string): void {

  //   this.mode = 'UPDATE';

  //   const isAmendmentScreen =
  //     this.eventType === 'AMD' ||
  //     this.sourceTab === 'pending' ||
  //     this.sourceTab === 'submitted' ||
  //     this.sourceTab === 'approved' ||
  //     this.sourceTab === 'rejected';

  //   // ==========================================
  //   // LOAD AMD EVENT DATA
  //   // ==========================================
  //   if (isAmendmentScreen) {

  //     this.api.getAmendmentByTnxId(tnxId).subscribe({

  //       next: (event) => {

  //         console.log('Loaded AMD event:', event);

  //         this.currentTx = event;
  //         console.log('RAW API response:', event);           // what does backend send?
  //         console.log('bankForm after patch:', this.bankForm.value); // what did form get?
  //         this.patchForm(event);

  //         switch (event.status) {

  //           case 'I':
  //             this.mode = 'UPDATE';
  //             this.screenMode = 'EDIT';
  //             this.importForm.enable();
  //             break;

  //           case 'S':
  //             this.mode = 'UPDATE';
  //             this.screenMode = 'SUBMITTED';
  //             this.importForm.disable();
  //             this.patchForm(event);
  //             break;

  //           case 'A':
  //             this.mode = 'UPDATE';
  //             this.screenMode = 'APPROVED';
  //             this.importForm.disable();
  //             break;

  //           case 'R':
  //             this.mode = 'REJECTED';
  //             this.screenMode = 'EDIT';
  //             this.importForm.enable();
  //             break;

  //           default:
  //             this.mode = 'UPDATE';
  //             this.screenMode = 'FINAL';
  //             this.importForm.disable();
  //         }
  //       },

  //       error: () => {
  //         this.snackBar.open('Amendment not found', 'Close', {
  //           duration: 3000
  //         });

  //         this.router.navigate(['/export-screen/inquiries']);
  //       }
  //     });

  //     return;
  //   }

  //   // ==========================================
  //   // LOAD LIVE LC DATA
  //   // ==========================================
  //   this.api.getTransactionByTnxId(tnxId).subscribe({

  //     next: tx => {

  //       console.log('Loaded LIVE LC:', tx);

  //       this.currentTx = tx;

  //       this.patchForm(tx);

  //       switch (tx.status) {

  //         case 'I':
  //           this.mode = 'UPDATE';
  //           this.screenMode = 'EDIT';
  //           this.importForm.enable();
  //           break;

  //         case 'S':
  //           this.mode = 'UPDATE';
  //           this.screenMode = 'SUBMITTED';
  //           this.importForm.disable();
  //           break;

  //         case 'A':
  //           this.mode = 'UPDATE';

  //           if (this.requestedMode === 'EDIT') {
  //             this.screenMode = 'EDIT';
  //             this.importForm.enable();
  //           } else {
  //             this.screenMode = 'APPROVED';
  //             this.importForm.disable();
  //           }
  //           break;

  //         case 'R':
  //           this.mode = 'REJECTED';
  //           this.screenMode = 'EDIT';
  //           this.importForm.enable();
  //           break;

  //         default:
  //           this.mode = 'UPDATE';
  //           this.screenMode = 'FINAL';
  //           this.importForm.disable();
  //       }
  //     },

  //     error: () => {

  //       this.snackBar.open('Transaction not found', 'Close', {
  //         duration: 3000
  //       });

  //       this.router.navigate(['/export-screen/inquiries']);
  //     }
  //   });
  // }

  // ======================================================
  // ENTER EDIT MODE  — three branches:
  //
  //  1. eventRefNo present  → historical read-only snapshot
  //     (Inquiries Live tab click)
  //
  //  2. AMD/amendment tabs  → load pending draft via tnxId
  //     (Amend pending/submitted/approved/rejected tabs)
  //
  //  3. Master LC            → load master record via tnxId
  //     (Enquiries non-live tabs)
  // ======================================================
  private enterEditMode(tnxId: string): void {

    this.mode = 'UPDATE';

    const normalizedSourceTab = (this.sourceTab ?? '')
      .toString()
      .trim()
      .toLowerCase();

    const isAmendmentTab =
      this.eventType === 'AMD' ||
      normalizedSourceTab === 'pending' ||
      normalizedSourceTab === 'submitted' ||
      normalizedSourceTab === 'approved' ||
      normalizedSourceTab === 'rejected';

    if (this.eventRefNo && !isAmendmentTab) {
      this.isHistoricalView = true;

      this.api.getAmendmentByEventRefNo(this.eventRefNo).subscribe({

        next: event => {
          this.currentTx = event;
          this.screenMode = 'APPROVED';
          this.importForm.disable();
          this.patchForm(event);
        },

        error: () => {
          this.snackBar.open('Event snapshot not found', 'Close', {
            duration: 3000,
          });
          this.router.navigate([
            '/dashboard/Trade-Services/export-screen/inquiries',
          ]);
        },
      });

      return;
    }

    if (this.sourceTab === 'live') {

      this.isHistoricalView = false;

      this.api.getAmendmentByTnxId(tnxId).subscribe({
        next: (event) => {
          this.currentTx = event;
          this.patchForm(event);

          if (event.status === 'S') {
            this.screenMode = 'SUBMITTED';
            this.importForm.disable();
          } else {
            this.screenMode = 'EDIT';
            this.importForm.enable();
          }
        },

        error: () => {
          this.api.getTransactionByTnxId(tnxId).subscribe({
            next: (tx) => {
              this.currentTx = {
                tnxId: tx.tnxId,
              } as ImportLcTransaction;

              this.patchForm(tx);
              this.screenMode = 'EDIT';
              this.importForm.enable();
            },

            error: () => {
              this.snackBar.open('Transaction not found', 'Close', {
                duration: 3000,
              });
              this.router.navigate([
                '/dashboard/Trade-Services/export-screen/inquiries',
              ]);
            },
          });
        },
      });

      return;
    }

    if (isAmendmentTab) {

      this.isHistoricalView = false;

      const amendment$ = this.eventRefNo
        ? this.api.getAmendmentByEventRefNo(this.eventRefNo)
        : this.api.getAmendmentByTnxId(tnxId);

      amendment$.subscribe({
        next: (event) => {
          this.currentTx = event;
          
          this.patchForm(event);

           // Show "Previous Value" for an amendment that was rejected and then resubmitted
    if (event.status === 'S' || event.status === 'I') {
      this.api.getEventRejectedTransaction(event.eventRefNo!).subscribe({
        next: (rejectedTx) => {
          if (!rejectedTx) return;
          this.storeRejectedTransaction = rejectedTx;
          this.compareImportLcData();
        },
        error: (err) => console.log('No rejected snapshot:', err),
      });
    }
          switch (event.status) {

            case 'I':
              this.mode = 'UPDATE';
              this.screenMode = 'EDIT';
              this.importForm.enable();
              break;

            case 'S':
              this.mode = 'UPDATE';
              this.screenMode = 'SUBMITTED';
              this.importForm.disable();
              break;

            case 'A':
              this.mode = 'UPDATE';
              this.screenMode = 'APPROVED';
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
          }
        },

        error: () => {
          this.snackBar.open('Amendment not found', 'Close', {
            duration: 3000,
          });
          this.router.navigate([
            '/dashboard/Trade-Services/export-screen/inquiries',
          ]);
        },
      });

      return;
    }

    this.isHistoricalView = false;

    this.api.getTransactionByTnxId(tnxId).subscribe({

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
            this.screenMode = 'SUBMITTED';
            this.importForm.disable();
            break;

          case 'A':
            this.mode = 'UPDATE';

            if (this.requestedMode === 'EDIT') {
              this.screenMode = 'EDIT';
              this.importForm.enable();
            } else {
              this.screenMode = 'APPROVED';
              this.importForm.disable();
            }

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
        }
      },

      error: () => {
        this.snackBar.open('Transaction not found', 'Close', {
          duration: 3000,
        });
        this.router.navigate([
          '/dashboard/Trade-Services/export-screen/inquiries',
        ]);
      },
    });
  }
  // Safe getters for html form access of the specific form groups
  get generalDetailsForm(): FormGroup {
    return this.importForm.get('generalDetails') as FormGroup;
  }
  get uploadForm(): FormGroup {
    return this.importForm.get('appUpload') as FormGroup;
  }
  get attachmentsArray(): FormArray {
    return this.importForm.get('attachments') as FormArray;
  }

  private patchForm(tx: ImportLcTransaction): void {

    const data = tx as any;

    this.importForm.patchValue({
      generalDetails: {
        customerRef: data.customerReference ?? '',
        advisingBank: data.advisingBankName ?? '',
        issuerRef: data.issuerReference ?? '',
      },
    });
  }

  scrollToSection(index: number) {
    this.currentStep = index;

    document
      .getElementById(`section-${index}`)
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
  }

  private flattenForm(): ImportLcTransaction {

    const general = this.importForm.value.generalDetails ?? {};

    return {
      companyId: this.companyId,
      customerReference: general.customerRef,
      advisingBankName: general.advisingBank,
      issuerReference: general.issuerRef,
      attachments: this.importForm.value.attachments,
    } as ImportLcTransaction;
  }

  // saveForm(): void {
  //   if (this.isSaving) return;
  //   this.isSaving = true;
  //   if (this.importForm.invalid) {
  //     this.importForm.markAllAsTouched();
  //     this.snackBar.open(
  //       'Please complete all required fields before saving.',
  //       'Close',
  //       { duration: 3000 }
  //     );
  //     return;
  //   }

  //   if (!this.companyId) {
  //     this.snackBar.open('Session expired or company not found. Please log in again.', 'Close', { duration: 3000 });
  //     return;
  //   }

  //   // 1. Flatten form
  //   const payload = this.flattenForm();

  //   // 2. Get tnxId (VERY IMPORTANT)
  //   const tnxId = this.currentTx?.event_refno && this.tnxId;

  //   if (!tnxId) {
  //     this.snackBar.open('Transaction ID missing. Cannot amend.', 'Close', { duration: 3000 });
  //     return;
  //   }

  //   console.log("Amend Payload:", payload);

  //   // 3. Call AMEND API
  //   this.api.saveamendTransaction(tnxId, payload).pipe(
  //     finalize(() => this.isSaving = false)
  //   ).subscribe({
  //     next: (res: ImportLcTransaction) => {

  //       this.snackBar.open(
  //         `Amendment saved (TNX ID: ${res.tnxId})`,
  //         'Close',
  //         { duration: 5000 }
  //       );

  //       // Navigate after success
  //       setTimeout(() => {
  //         this.router.navigate(['/export-screen/inquiries']);
  //       }, 50);
  //     },
  //     error: () => {
  //       this.snackBar.open('Error saving amendment', 'Close', { duration: 3000 });
  //     }
  //   });
  // }
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
      .saveamendTransaction(tnxId, payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (res: ImportLcTransaction) => {
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
              this.router.navigate([
                '/dashboard/Trade-Services/export-screen/approved-inquiry-records',
              ]),
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

  submitLc(): void {

    const eventRefNo = this.currentTx?.eventRefNo;

    if (!eventRefNo) {
      this.snackBar.open('Please save the amendment draft first.', 'Close', {
        duration: 3000,
      });
      return;
    }

    const payload = {
      ...this.flattenForm(),
      event: 'AMD',
      tnxId: this.tnxId,
    };

    this.api.submitAmendment(eventRefNo, payload).subscribe({
      next: (res) => {
        this.router.navigate(
          ['/dashboard/Trade-Services/export-screen/success'],
          {
            state: { source: 'IMPORT_LC_AMD', transaction: res },
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
              '/dashboard/Trade-Services/export-screen/approved-inquiry-records',
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
    this.router.navigate([
      '/dashboard/Trade-Services/export-screen/approved-inquiry-records',
    ]);
  }

  updateAttachments(files: File[]) {

    const arr = this.importForm.get('attachments') as FormArray;

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
  const eventRefNo = this.currentTx?.eventRefNo;

  if (this.importForm.invalid || !eventRefNo) {
    this.snackBar.open('Invalid form or missing amendment reference', 'Close', {
      duration: 3000,
    });
    return;
  }

  const payload = {
    ...this.flattenForm(),
    event: 'AMD',
    tnxId: this.currentTx.tnxId,
  };

  this.api.updatePendingAmendmentTransaction(eventRefNo, payload).subscribe({
    next: (res) => {
      this.currentTx = { ...this.currentTx, ...res };
      this.snackBar.open(`Amendment updated (Ref: ${res.eventRefNo})`, 'Close', {
        duration: 3000,
      });
      this.router.navigate(
        ['/dashboard/Trade-Services/import-lc/approved-inquiry-records'], // use your actual route
        { queryParams: { tab: 'pending' } },
      );
    },
    error: () => {
      this.snackBar.open('Failed to update amendment', 'Close', { duration: 3000 });
    },
  });
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
      ...this.flattenForm(),
      event: 'AMD',
      tnxId: this.tnxId,
    };
    this.api.approveAmendment(eventRefNo, payload).subscribe({

      next: () => {
        this.snackBar.open('Amendment approved. Live LC updated.', 'Close', {
          duration: 3000,
        });
        setTimeout(
          () =>
            this.router.navigate([
              '/dashboard/Trade-Services/export-screen/inquiries',
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

      this.api.rejectAmendment(this.currentTx?.eventRefNo!, reason).subscribe({
        next: (res) => {
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
      ['/dashboard/Trade-Services/export-screen/approved-inquiry-records'],
      {
        queryParams: { tab },
      },
    );
  }

  updateRejected(): void {
    if (this.importForm.invalid || !this.currentTx?.eventRefNo) {
      this.snackBar.open('Invalid form or missing transaction ID', 'Close', {
        duration: 3000,
      });
      return;
    }

    const payload = this.flattenForm(); // flatten form values
    payload.eventRefNo = this.currentTx.eventRefNo;

    this.api
      .updateRejectedAmendmentTransaction(payload.eventRefNo, payload)
      .subscribe({
        next: (res) => {
          this.snackBar.open(
            `Rejected transaction updated and moved back to Pending (TNX: ${res.tnxId})`,
            'Close',
            { duration: 3000 },
          );

          // Navigate back to inquiries with Pending tab
          this.router.navigate([
            '/dashboard/Trade-Services/export-screen/approved-inquiry-records',
          ]);
        },
        error: () => {
          this.snackBar.open('Failed to update rejected transaction', 'Close', {
            duration: 3000,
          });
        },
      });
  }
 // old and new values working
previousDynamicValues: { [key: string]: any } = {};
storeRejectedTransaction: ImportLcTransaction | null = null;
    previousValues: { [key: string]: any } = {};
    private readonly ImportLcFields = [
    // General Details
    'customerReference',
    'advisingBankName',
    'issuerReference',
  ];
  private compareImportLcData(): void {
  this.previousValues = this.transactionComparisonService.compare(
    this.currentTx,
    this.storeRejectedTransaction,
    this.ImportLcFields,
  );

  this.previousDynamicValues =
    this.transactionComparisonService.compareDynamicFields(
      this.currentTx?.dynamicFields ?? [],
      this.storeRejectedTransaction?.dynamicFields ?? [],
    );

  console.log('Previous import LC values:', this.previousValues);
  console.log('Previous dynamic values:', this.previousDynamicValues);
}

    hasPreviousValue(field: string): boolean {
    return (
      this.previousValues &&
      Object.prototype.hasOwnProperty.call(this.previousValues, field) &&
      this.previousValues[field] !== null &&
      this.previousValues[field] !== undefined &&
      String(this.previousValues[field]).trim() !== ''
    );
  }

  // =====================================================
  // GET PREVIOUS EXPORT COLLECTION VALUE
  // =====================================================

  getPreviousValue(field: string): any {
    return this.previousValues?.[field] ?? '';
  }


}

