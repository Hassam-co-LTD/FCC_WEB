import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../api.service';
import {
  TransferDTO,
  CreateTransferRequest,
  RecordsListTransferDTO,
  AccountsMaster,
} from '../../../../models/my-accounts';
import { AuthService } from '../../../auth.service';

@Injectable({
  providedIn: 'root'
})
export class MyAccountsService {
  private currentTransferSubject = new BehaviorSubject<TransferDTO | null>(null);
  private transfersSubject = new BehaviorSubject<RecordsListTransferDTO[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private userRoleSubject = new BehaviorSubject<string>('');

  // Public observables
  public currentTransfer$ = this.currentTransferSubject.asObservable();
  public transfers$ = this.transfersSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  public userRole$ = this.userRoleSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {
    // Initialize user role from AuthService
    const userRole = this.authService.getUserCategory() || '';
    this.userRoleSubject.next(userRole);
    
    // Also store in sessionStorage for backward compatibility
    if (userRole) {
      sessionStorage.setItem('userRole', userRole);
    }
  }

  /**
   * Initialize form data with defaults
   */
  initializeTransferForm(): CreateTransferRequest {
    return {
      productType: 'Internal Transfer',
      transferFrom: '',
      transferTo: '',
      amount: 0,
      currency: 'PKR',
      transferDate: new Date(),
      transactionRemarks: '',
      TransactionId: ''
    };
  }

  /**
   * Validate if user has access to transfer from/to specific accounts
   */
  validateTransferAccess(transferData: CreateTransferRequest): Observable<boolean> {
    return new Observable(observer => {
      // Check FROM account access
      this.apiService.checkAccountAccess(transferData.transferFrom, 'TRANSFER_FROM')
        .pipe(catchError(() => of(false)))
        .subscribe({
          next: (hasFromAccess) => {
            if (!hasFromAccess) {
              this.errorSubject.next('You do not have permission to transfer from this account');
              observer.next(false);
              observer.complete();
              return;
            }

            // Check TO account access
            this.apiService.checkAccountAccess(transferData.transferTo, 'TRANSFER_TO')
              .pipe(catchError(() => of(false)))
              .subscribe({
                next: (hasToAccess) => {
                  if (!hasToAccess) {
                    this.errorSubject.next('You do not have permission to transfer to this account');
                    observer.next(false);
                  } else {
                    observer.next(true);
                  }
                  observer.complete();
                }
              });
          }
        });
    });
  }

  /**
   * Get accounts that user can transfer FROM using ApiService
   */
  getTransferFromAccounts(): Observable<any[]> {
    const userRole = this.userRoleSubject.value;
    const companyId = this.authService.getCompanyId() || '';
    const userId = this.authService.getUserId() || '';

    return this.apiService.getTransferFromAccounts(userRole, companyId, userId).pipe(
      map(accounts => accounts.map(account => ({
        value: account.accountNumber,
        label: `${account.accountName} (${account.accountNumber}) - ${account.currency} ${account.currentBalance?.toFixed(2) || '0.00'}`,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        balance: account.currentBalance || 0,
        currency: account.currency,
        accountType: account.accountType
      }))),
      catchError(error => {
        this.errorSubject.next('Failed to load transfer from accounts');
        return of([]);
      })
    );
  }

  /**
   * Get accounts that user can transfer TO using ApiService
   */
  getTransferToAccounts(): Observable<any[]> {
    const userRole = this.userRoleSubject.value;
    const companyId = this.authService.getCompanyId() || '';
    const userId = this.authService.getUserId() || '';

    return this.apiService.getTransferToAccounts(userRole, companyId, userId).pipe(
      map(accounts => accounts.map(account => ({
        value: account.accountNumber,
        label: `${account.accountName} (${account.accountNumber}) - ${account.currency}`,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        currency: account.currency,
        accountType: account.accountType
      }))),
      catchError(error => {
        this.errorSubject.next('Failed to load transfer to accounts');
        return of([]);
      })
    );
  }

  /**
   * Check if current user can transfer funds
   */
  canTransferFunds(): Observable<boolean> {
    // Use AuthService for permission check
    const canTransfer = this.authService.canTransfer();
    return of(canTransfer);
  }

  /**
   * Check if current user can approve transfers
   */
  canApproveTransfers(): Observable<boolean> {
    // Use AuthService for permission check
    const canApprove = this.authService.canApprove();
    return of(canApprove);
  }

  /**
   * Get account options for dropdown (backward compatibility)
   */
  getAccountOptions(): Observable<any[]> {
    return this.getTransferFromAccounts();
  }

  /**
   * Create a new transfer draft with validation
   */
  createTransferDraft(transferData: CreateTransferRequest): Observable<TransferDTO> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return new Observable(observer => {
      // Get company ID from AuthService
      const companyId = this.authService.getCompanyId();
      if (!companyId) {
        this.errorSubject.next('Company ID not found. Please login again.');
        this.loadingSubject.next(false);
        observer.error(new Error('Company ID not found'));
        return;
      }

      // First validate access
      this.validateTransferAccess(transferData).subscribe({
        next: (isValid) => {
          if (!isValid) {
            this.loadingSubject.next(false);
            observer.error(new Error('Transfer access validation failed'));
            return;
          }

          // Map to TransferDTO for backend
          const transferDTO: TransferDTO = {
            productType: transferData.productType,
            transferFrom: transferData.transferFrom,
            transferTo: transferData.transferTo,
            amount: transferData.amount,
            currency: transferData.currency || 'PKR',
            transferDate: transferData.transferDate,
            transactionRemarks: transferData.transactionRemarks,
            TransactionId: transferData.TransactionId,
            status: 'I',
            companyId: companyId  // Add companyId from AuthService
          };

          this.apiService.saveTransferDraft(transferDTO).subscribe({
            next: (transfer) => {
              this.currentTransferSubject.next(transfer);
              this.loadingSubject.next(false);
              observer.next(transfer);
              observer.complete();
            },
            error: (error) => {
              this.errorSubject.next(error.message || 'Failed to save draft');
              this.loadingSubject.next(false);
              observer.error(error);
            }
          });
        },
        error: (error) => {
          this.loadingSubject.next(false);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Get draft transfers
   */
  getDraftTransfers(): void {
    this.loadingSubject.next(true);
    this.apiService.getTransferRecordsByStatus('I').subscribe({
      next: (transfers) => {
        this.transfersSubject.next(transfers);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        this.errorSubject.next(error.message || 'Failed to load drafts');
        this.loadingSubject.next(false);
      }
    });
  }

  /**
   * Get submitted transfers
   */
  getSubmittedTransfers(): void {
    this.loadingSubject.next(true);
    this.apiService.getTransferRecordsByStatus('S').subscribe({
      next: (transfers) => {
        this.transfersSubject.next(transfers);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        this.errorSubject.next(error.message || 'Failed to load submitted transfers');
        this.loadingSubject.next(false);
      }
    });
  }

  /**
   * Get approved transfers
   */
  getApprovedTransfers(): void {
    this.loadingSubject.next(true);
    this.apiService.getTransferRecordsByStatus('A').subscribe({
      next: (transfers) => {
        this.transfersSubject.next(transfers);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        this.errorSubject.next(error.message || 'Failed to load approved transfers');
        this.loadingSubject.next(false);
      }
    });
  }

  /**
   * Get rejected transfers
   */
  getRejectedTransfers(): void {
    this.loadingSubject.next(true);
    this.apiService.getTransferRecordsByStatus('R').subscribe({
      next: (transfers) => {
        this.transfersSubject.next(transfers);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        this.errorSubject.next(error.message || 'Failed to load rejected transfers');
        this.loadingSubject.next(false);
      }
    });
  }

  /**
   * Load transfer by ID for editing
   */
  loadTransferForEdit(tnxId: string): void {
    this.loadingSubject.next(true);
    this.apiService.getTransferByTnxId(tnxId).subscribe({
      next: (transfer) => {
        this.currentTransferSubject.next(transfer);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        this.errorSubject.next(error.message || 'Failed to load transfer');
        this.loadingSubject.next(false);
      }
    });
  }

  /**
   * Update existing draft with validation
   */
  updateTransferDraft(tnxId: string, transferData: any): Observable<TransferDTO> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return new Observable(observer => {
      // Validate access for the updated data
      this.validateTransferAccess(transferData).subscribe({
        next: (isValid) => {
          if (!isValid) {
            this.loadingSubject.next(false);
            observer.error(new Error('Transfer access validation failed'));
            return;
          }

          const transferDTO: TransferDTO = {
            ...transferData,
            tnxId: tnxId,
            status: 'I'
          };

          this.apiService.updateTransferDraft(tnxId, transferDTO).subscribe({
            next: (transfer) => {
              this.currentTransferSubject.next(transfer);
              this.loadingSubject.next(false);
              observer.next(transfer);
              observer.complete();
            },
            error: (error) => {
              this.errorSubject.next(error.message || 'Failed to update draft');
              this.loadingSubject.next(false);
              observer.error(error);
            }
          });
        },
        error: (error) => {
          this.loadingSubject.next(false);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Submit transfer for approval
   */
  submitTransfer(tnxId: string, transferData: any): Observable<TransferDTO> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return new Observable(observer => {
      // First check if user can submit transfers
      this.canTransferFunds().subscribe({
        next: (canTransfer) => {
          if (!canTransfer) {
            this.errorSubject.next('You do not have permission to submit transfers');
            this.loadingSubject.next(false);
            observer.error(new Error('Insufficient permissions'));
            return;
          }

          const transferDTO: TransferDTO = {
            ...transferData,
            tnxId: tnxId,
            status: 'S'
          };

          this.apiService.submitTransfer(tnxId, transferDTO).subscribe({
            next: (transfer) => {
              this.currentTransferSubject.next(transfer);
              this.loadingSubject.next(false);
              observer.next(transfer);
              observer.complete();
            },
            error: (error) => {
              this.errorSubject.next(error.message || 'Failed to submit transfer');
              this.loadingSubject.next(false);
              observer.error(error);
            }
          });
        },
        error: (error) => {
          this.loadingSubject.next(false);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Approve transfer with permission check
   */
  approveTransfer(tnxId: string, transferData: any): Observable<TransferDTO> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return new Observable(observer => {
      // First check if user can approve transfers
      this.canApproveTransfers().subscribe({
        next: (canApprove) => {
          if (!canApprove) {
            this.errorSubject.next('You do not have permission to approve transfers');
            this.loadingSubject.next(false);
            observer.error(new Error('Insufficient permissions'));
            return;
          }

          const transferDTO: TransferDTO = {
            ...transferData,
            tnxId: tnxId,
            status: 'A'
          };

          this.apiService.approveTransfer(tnxId, transferDTO).subscribe({
            next: (transfer) => {
              this.currentTransferSubject.next(transfer);
              this.loadingSubject.next(false);
              observer.next(transfer);
              observer.complete();
            },
            error: (error) => {
              this.errorSubject.next(error.message || 'Failed to approve transfer');
              this.loadingSubject.next(false);
              observer.error(error);
            }
          });
        },
        error: (error) => {
          this.loadingSubject.next(false);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Reject transfer with permission check
   */
  rejectTransfer(tnxId: string, reason: string): Observable<TransferDTO> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return new Observable(observer => {
      // First check if user can approve/reject transfers
      this.canApproveTransfers().subscribe({
        next: (canApprove) => {
          if (!canApprove) {
            this.errorSubject.next('You do not have permission to reject transfers');
            this.loadingSubject.next(false);
            observer.error(new Error('Insufficient permissions'));
            return;
          }

          this.apiService.rejectTransfer(tnxId, reason).subscribe({
            next: (transfer) => {
              this.currentTransferSubject.next(transfer);
              this.loadingSubject.next(false);
              observer.next(transfer);
              observer.complete();
            },
            error: (error) => {
              this.errorSubject.next(error.message || 'Failed to reject transfer');
              this.loadingSubject.next(false);
              observer.error(error);
            }
          });
        },
        error: (error) => {
          this.loadingSubject.next(false);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Update rejected transfer back to draft
   */
  updateRejectedTransfer(tnxId: string, transferData: any): Observable<TransferDTO> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return new Observable(observer => {
      const transferDTO: TransferDTO = {
        ...transferData,
        tnxId: tnxId,
        status: 'I'
      };

      this.apiService.updateRejectedTransfer(tnxId, transferDTO).subscribe({
        next: (transfer) => {
          this.currentTransferSubject.next(transfer);
          this.loadingSubject.next(false);
          observer.next(transfer);
          observer.complete();
        },
        error: (error) => {
          this.errorSubject.next(error.message || 'Failed to update rejected transfer');
          this.loadingSubject.next(false);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Get account details by account number
   */
  getAccountDetails(accountNumber: string): Observable<AccountsMaster | null> {
    return this.apiService.getAccountByNumber(accountNumber).pipe(
      catchError(() => of(null))
    );
  }

  /**
   * Get all transfers by status (full TransferDTO objects)
   */
  getTransfersByStatus(status: string): Observable<TransferDTO[]> {
    this.loadingSubject.next(true);
    return new Observable(observer => {
      this.apiService.getTransfersByStatus(status).subscribe({
        next: (transfers) => {
          this.loadingSubject.next(false);
          observer.next(transfers);
          observer.complete();
        },
        error: (error) => {
          this.loadingSubject.next(false);
          this.errorSubject.next(error.message || `Failed to load ${status} transfers`);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Clear current transfer
   */
  clearCurrentTransfer(): void {
    this.currentTransferSubject.next(null);
  }

  /**
   * Clear errors
   */
  clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Get status display text
   */
  getStatusDisplay(status: string): string {
    switch (status) {
      case 'I': return 'Draft';
      case 'S': return 'Submitted';
      case 'A': return 'Approved';
      case 'R': return 'Rejected';
      default: return 'Unknown';
    }
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'I': return 'warn';
      case 'S': return 'accent';
      case 'A': return 'primary';
      case 'R': return 'warn';
      default: return '';
    }
  }

  /**
   * Update user role (called after login)
   */
  updateUserRole(): void {
    const role = this.authService.getUserCategory() || '';
    this.userRoleSubject.next(role);
    sessionStorage.setItem('userRole', role);
  }

  /**
   * Get current user role
   */
  getCurrentUserRole(): string {
    return this.userRoleSubject.value;
  }

  /**
   * Get accessible accounts for user
   */
  getAccessibleAccounts(): Observable<AccountsMaster[]> {
    const userRole = this.userRoleSubject.value;
    const companyId = this.authService.getCompanyId() || '';
    const userId = this.authService.getUserId() || '';
    
    return this.apiService.getAccessibleAccounts(userRole, companyId, userId).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Check if user can perform specific action on account
   */
  canPerformAccountAction(accountNumber: string, action: string): Observable<boolean> {
    return this.apiService.checkAccountAccess(accountNumber, action).pipe(
      catchError(() => of(false))
    );
  }

  /**
   * Get all company accounts (admin view)
   */
  getAllCompanyAccounts(): Observable<AccountsMaster[]> {
    const companyId = this.authService.getCompanyId() || '';
    return this.apiService.getCompanyAccounts(companyId).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Create a new account (admin only)
   */
  createAccount(accountData: any): Observable<string> {
    // For admin users only
    if (this.userRoleSubject.value !== 'ADMIN') {
      this.errorSubject.next('Only admin users can create accounts');
      return of('Permission denied');
    }
    
    const companyId = this.authService.getCompanyId();
    if (!companyId) {
      return of('Company ID not found');
    }
    
    const accountWithCompany = {
      ...accountData,
      companyId: companyId,
      isActive: true
    };
    
    return this.apiService.createAccount(accountWithCompany).pipe(
      catchError(error => of('Error creating account: ' + error.message))
    );
  }

  /**
   * Update existing account (admin only)
   */
  updateAccount(accountData: any): Observable<string> {
    // For admin users only
    if (this.userRoleSubject.value !== 'ADMIN') {
      this.errorSubject.next('Only admin users can update accounts');
      return of('Permission denied');
    }
    
    return this.apiService.updateAccount(accountData).pipe(
      catchError(error => of('Error updating account: ' + error.message))
    );
  }

  /**
   * Get role details by code
   */
  getRoleDetails(roleCode: string): Observable<any> {
    return this.apiService.getRoleByCode(roleCode).pipe(
      catchError(() => of(null))
    );
  }

  /**
   * Get user permissions based on role
   */
  getUserPermissions(): Observable<any> {
    const userRole = this.userRoleSubject.value;
    if (!userRole) return of({});

    return this.apiService.getRoleByCode(userRole).pipe(
      map(role => ({
        canTransfer: role?.canTransferFunds || false,
        canApprove: role?.canApproveTransfers || false,
        canCreateAccounts: role?.canCreateAccounts || false,
        canEditAccounts: role?.canEditAccounts || false,
        approvalLevel: role?.approvalLevel || 0
      })),
      catchError(() => of({}))
    );
  }

  /**
   * Validate transfer amount against account limits
   */
  validateTransferAmount(accountNumber: string, amount: number): Observable<{ isValid: boolean; message: string }> {
    return new Observable(observer => {
      this.getAccountDetails(accountNumber).subscribe(account => {
        if (!account) {
          observer.next({ isValid: false, message: 'Account not found' });
          observer.complete();
          return;
        }

        // Check max transfer limit
        if (account.maxTransferLimit && amount > account.maxTransferLimit) {
          observer.next({
            isValid: false,
            message: `Amount exceeds maximum transfer limit of ${account.currency} ${account.maxTransferLimit}`
          });
          observer.complete();
          return;
        }

        // Check daily transfer limit
        if (account.dailyTransferLimit) {
          // Note: Would need to get daily transfer usage from backend
          // For now, just check against limit
          if (amount > account.dailyTransferLimit) {
            observer.next({
              isValid: false,
              message: `Amount exceeds daily transfer limit of ${account.currency} ${account.dailyTransferLimit}`
            });
            observer.complete();
            return;
          }
        }

        // Check account balance for transfer from accounts
        if (account.currentBalance < amount) {
          observer.next({
            isValid: false,
            message: `Insufficient balance. Available: ${account.currency} ${account.currentBalance}`
          });
          observer.complete();
          return;
        }

        observer.next({ isValid: true, message: 'Amount is valid' });
        observer.complete();
      });
    });
  }

  /**
   * Get transaction summary for dashboard
   */
  getTransactionSummary(): Observable<any> {
    return new Observable(observer => {
      const companyId = this.authService.getCompanyId() || '';

      // Get all status counts
      const statuses = ['I', 'S', 'A', 'R'];
      const summary: any = {
        total: 0,
        draft: 0,
        submitted: 0,
        approved: 0,
        rejected: 0,
        pendingApproval: 0
      };

      let completed = 0;

      statuses.forEach(status => {
        this.apiService.getTransfersByStatus(status).subscribe(transfers => {
          switch (status) {
            case 'I':
              summary.draft = transfers.length;
              break;
            case 'S':
              summary.submitted = transfers.length;
              summary.pendingApproval = transfers.length;
              break;
            case 'A':
              summary.approved = transfers.length;
              break;
            case 'R':
              summary.rejected = transfers.length;
              break;
          }

          completed++;

          if (completed === statuses.length) {
            summary.total = summary.draft + summary.submitted + summary.approved + summary.rejected;
            observer.next(summary);
            observer.complete();
          }
        }, () => {
          completed++;
          if (completed === statuses.length) {
            observer.next(summary);
            observer.complete();
          }
        });
      });
    });
  }

  /**
   * Get current user info from AuthService
   */
  getCurrentUserInfo() {
    return {
      userId: this.authService.getUserId(),
      companyId: this.authService.getCompanyId(),
      role: this.userRoleSubject.value
    };
  }

  /**
   * Check if user is logged in
   */
  isAuthenticated(): boolean {
    return this.authService.checkAuth();
  }

  /**
   * Logout user
   */
  logout(): void {
    this.authService.logout();
    this.clearCurrentTransfer();
    this.userRoleSubject.next('');
  }
}