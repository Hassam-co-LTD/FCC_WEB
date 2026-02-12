import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Observable, of, Subscription } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
 
// Import your models and services
import { AccountsMaster } from '../../core/models/my-accounts';
import { ApiService } from '../../core/services/api.service';
import { MyAccountsService } from '../../core/services/user-service/Payment-Service/my-accounts-services/account-transfer';
import { AuthService } from '../../core/services/auth.service';
 
// Base interface for account data
export interface BaseAccount {
  accountNumber: string;
  accountName: string;
  accountType: string;
  currency: string;
  balance?: number;
  currentBalance?: number;
  availableBalance?: number;
  maskedAccountNumber?: string;
  iban?: string;
  branch?: string;
  status?: string;
  isActive?: boolean;
  // Additional properties from AccountsMaster
  companyId?: string;
  accessPolicyType?: string;
  minApprovalLevel?: number;
  maxTransferLimit?: number;
  dailyTransferLimit?: number;
  requiresDualAuthorization?: boolean;
  allowedRoles?: string;
  createdOn?: Date;
  updatedOn?: Date;
}
 
export interface AccountSearchDialogData {
  accountType: 'transferFrom' | 'transferTo';
  currentSelectedAccount?: string;
  // Optional: Custom data source function
  getAccounts?: () => Observable<BaseAccount[]>;
  // Optional: Custom mapping function to transform API data
  mapAccount?: (account: any) => BaseAccount;
}
 
@Component({
  selector: 'app-account-search-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './account-search-dialog.html',
  styleUrls: ['./account-search-dialog.scss']
})
export class AccountSearchDialogComponent implements OnInit, OnDestroy {
  // Form Control
  searchControl = new FormControl('');
 
  // Table Configuration
  displayedColumns: string[] = ['select', 'accountNumber', 'accountName', 'accountType', 'currency', 'balance', 'availableBalance'];
 
  // Data
  dataSource: BaseAccount[] = [];
  filteredAccounts: BaseAccount[] = [];
  selectedAccount: BaseAccount | null = null;
 
  // Loading and Error States
  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';
 
  // User Info
  currentUserRole: string = '';
  currentUserId: string = '';
  currentCompanyId: string = '';
 
  // Subscriptions
  private searchSubscription?: Subscription;
 
  constructor(
    public dialogRef: MatDialogRef<AccountSearchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AccountSearchDialogData,
    private apiService: ApiService,
    private myAccountsService: MyAccountsService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}
 
  ngOnInit() {
    // Get current user info from AuthService
    this.currentUserRole = this.authService.getUserRole() || '';
    this.currentUserId = this.authService.getUserId() || '';
    this.currentCompanyId = this.authService.getCompanyId() || '';
   
    // Load accounts
    this.loadAccounts();
   
    // Set up search with debounce
    this.searchSubscription = this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        this.filterAccounts(searchTerm || '');
      });
 
    // If there's a currently selected account, pre-select it
    if (this.data.currentSelectedAccount) {
      setTimeout(() => {
        this.preselectAccount(this.data.currentSelectedAccount || '');
      }, 500); // Give time for accounts to load
    }
  }
 
  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
 
  /**
   * Load accounts from the appropriate source
   */
  loadAccounts() {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    this.selectedAccount = null;
   
    let accountsObservable: Observable<BaseAccount[]>;
 
    // Check if custom data source function is provided
    if (this.data.getAccounts) {
      accountsObservable = this.data.getAccounts();
    } else {
      // Use default service based on account type
      if (this.data.accountType === 'transferFrom') {
        accountsObservable = this.myAccountsService.getTransferFromAccounts().pipe(
          map(accounts => this.transformToBaseAccounts(accounts))
        );
      } else {
        accountsObservable = this.myAccountsService.getTransferToAccounts().pipe(
          map(accounts => this.transformToBaseAccounts(accounts))
        );
      }
    }
 
    accountsObservable.pipe(
      catchError(error => {
        console.error('Failed to load accounts:', error);
        this.hasError = true;
        this.errorMessage = error.message || 'Failed to load accounts. Please try again.';
        this.isLoading = false;
        return of([]);
      })
    ).subscribe({
      next: (accounts) => {
        this.dataSource = accounts;
        this.filteredAccounts = [...accounts];
        this.isLoading = false;
       
        // Apply custom mapping if provided
        if (this.data.mapAccount && accounts.length > 0) {
          this.dataSource = accounts.map(account => this.data.mapAccount!(account));
          this.filteredAccounts = [...this.dataSource];
        }
       
        // After loading, try to pre-select the account if one was provided
        if (this.data.currentSelectedAccount && this.dataSource.length > 0) {
          this.preselectAccount(this.data.currentSelectedAccount);
        }
       
        // Show success message
        if (accounts.length > 0) {
          this.snackBar.open(`Loaded ${accounts.length} accounts`, 'Close', {
            duration: 2000,
            panelClass: ['success-snackbar']
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = error.message || 'Failed to load accounts. Please try again.';
        this.snackBar.open(this.errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
 
  /**
   * Transform MyAccountsService response to BaseAccount format
   */
  private transformToBaseAccounts(accounts: any[]): BaseAccount[] {
    return accounts.map(account => {
      // Extract account number from different possible sources
      const accountNumber = account.accountNumber || account.value || '';
      const accountName = account.accountName || account.label?.split('(')[0]?.trim() || 'Unknown Account';
     
      // Extract balance information
      const balance = account.balance || account.currentBalance || 0;
      const availableBalance = account.availableBalance || balance;
     
      // Extract currency (default to PKR if not specified)
      const currency = account.currency || 'PKR';
     
      // Create the BaseAccount object
      const baseAccount: BaseAccount = {
        accountNumber: accountNumber,
        accountName: accountName,
        accountType: account.accountType || '',
        currency: currency,
        balance: balance,
        currentBalance: account.currentBalance || balance,
        availableBalance: availableBalance,
        maskedAccountNumber: this.maskAccountNumber(accountNumber),
        iban: account.iban || '',
        branch: account.branch || '',
        status: account.status || (account.isActive ? 'Active' : 'Inactive'),
        isActive: account.isActive !== undefined ? account.isActive : true,
        companyId: account.companyId || this.currentCompanyId,
        accessPolicyType: account.accessPolicyType || '',
        minApprovalLevel: account.minApprovalLevel,
        maxTransferLimit: account.maxTransferLimit,
        dailyTransferLimit: account.dailyTransferLimit,
        requiresDualAuthorization: account.requiresDualAuthorization,
        allowedRoles: account.allowedRoles,
        createdOn: account.createdOn ? new Date(account.createdOn) : undefined,
        updatedOn: account.updatedOn ? new Date(account.updatedOn) : undefined
      };
     
      return baseAccount;
    }).filter(account => account.accountNumber); // Filter out empty accounts
  }
 
  /**
   * Preselect an account based on account number
   */
  private preselectAccount(accountNumber: string) {
    if (!accountNumber) return;
   
    // Clean the account number (remove any masking)
    const cleanAccountNumber = this.unmaskAccountNumber(accountNumber);
   
    // Try to find in current dataSource
    const account = this.dataSource.find(acc =>
      acc.accountNumber === cleanAccountNumber ||
      acc.accountNumber === accountNumber
    );
   
    if (account) {
      this.selectedAccount = account;
      this.snackBar.open(`Pre-selected account: ${account.accountName}`, 'Close', {
        duration: 2000
      });
    } else {
      // If account not in current list, try to fetch its details from API
      this.myAccountsService.getAccountDetails(cleanAccountNumber).subscribe({
        next: (accountDetail) => {
          if (accountDetail) {
            const baseAccount: BaseAccount = {
              accountNumber: accountDetail.accountNumber,
              accountName: accountDetail.accountName,
              accountType: accountDetail.accountType,
              currency: accountDetail.currency,
              balance: accountDetail.currentBalance,
              currentBalance: accountDetail.currentBalance,
              availableBalance: accountDetail.currentBalance,
              maskedAccountNumber: this.maskAccountNumber(accountDetail.accountNumber),
              status: accountDetail.isActive ? 'Active' : 'Inactive',
              isActive: accountDetail.isActive,
              companyId: accountDetail.companyId,
              accessPolicyType: accountDetail.accessPolicyType || '',
              minApprovalLevel: accountDetail.minApprovalLevel,
              maxTransferLimit: accountDetail.maxTransferLimit,
              dailyTransferLimit: accountDetail.dailyTransferLimit,
              requiresDualAuthorization: accountDetail.requiresDualAuthorization,
              allowedRoles: accountDetail.allowedRoles
            };
           
            // Add to dataSource and select
            this.dataSource.push(baseAccount);
            this.filteredAccounts = [...this.dataSource];
            this.selectedAccount = baseAccount;
           
            this.snackBar.open(`Loaded pre-selected account: ${baseAccount.accountName}`, 'Close', {
              duration: 2000
            });
          }
        },
        error: () => {
          // Silently fail - account just won't be pre-selected
        }
      });
    }
  }
 
  /**
   * Remove mask from account number if present
   */
  private unmaskAccountNumber(maskedNumber: string): string {
    // If it's masked (contains ••••), extract the last 4 digits
    if (maskedNumber.includes('••••')) {
      const parts = maskedNumber.split('••••');
      if (parts.length > 1 && parts[1]) {
        return parts[1];
      }
    }
    return maskedNumber;
  }
 
  /**
   * Filter accounts based on search term
   */
  filterAccounts(searchTerm: string) {
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredAccounts = [...this.dataSource];
      return;
    }
 
    const term = searchTerm.toLowerCase().trim();
    this.filteredAccounts = this.dataSource.filter(account =>
      account.accountNumber.toLowerCase().includes(term) ||
      account.accountName.toLowerCase().includes(term) ||
      account.accountType.toLowerCase().includes(term) ||
      (account.iban && account.iban.toLowerCase().includes(term)) ||
      (account.branch && account.branch.toLowerCase().includes(term)) ||
      (account.maskedAccountNumber && account.maskedAccountNumber.toLowerCase().includes(term)) ||
      account.currency.toLowerCase().includes(term)
    );
  }
 
  /**
   * Select an account
   */
  selectAccount(account: BaseAccount) {
    // Check if user can access this account
    if (!this.canAccessAccount(account)) {
      this.snackBar.open(`You don't have permission to access this account (${account.accountName})`, 'Close', {
        duration: 3000,
        panelClass: ['warn-snackbar']
      });
      return;
    }
   
    this.selectedAccount = account;
   
    // Ensure maskedAccountNumber is set
    if (!account.maskedAccountNumber) {
      account.maskedAccountNumber = this.maskAccountNumber(account.accountNumber);
    }
   
    console.log('Selected account:', account);
  }
 
  /**
   * Confirm selection and return selected account
   */
  confirmSelection() {
    if (this.selectedAccount && this.canAccessAccount(this.selectedAccount)) {
      // Return the full BaseAccount object with additional metadata
      const returnData = {
        ...this.selectedAccount,
        selectionTimestamp: new Date(),
        accountType: this.data.accountType
      };
     
      this.dialogRef.close(returnData);
    } else if (!this.selectedAccount) {
      this.snackBar.open('Please select an account first', 'Close', {
        duration: 3000,
        panelClass: ['warn-snackbar']
      });
    } else {
      this.snackBar.open('You do not have permission to select this account', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }
 
  /**
   * Close dialog without selection
   */
  closeDialog() {
    this.dialogRef.close();
  }
 
  /**
   * Check if user can access this account
   */
  canAccessAccount(account: BaseAccount): boolean {
    // If no restrictions specified, allow access
    if (!account.allowedRoles && !account.minApprovalLevel && !account.requiresDualAuthorization) {
      return true;
    }
   
    // Check if user role is in allowed roles
    if (account.allowedRoles) {
      const allowedRolesArray = account.allowedRoles.split(',').map(role => role.trim());
      if (!allowedRolesArray.includes(this.currentUserRole)) {
        return false;
      }
    }
   
    // Check approval level (if specified)
    if (account.minApprovalLevel !== undefined && account.minApprovalLevel !== null) {
      const userApprovalLevel = this.getUserApprovalLevel(this.currentUserRole);
      if (userApprovalLevel < account.minApprovalLevel) {
        return false;
      }
    }
   
    // Check if user has required permissions via AuthService
    if (this.data.accountType === 'transferFrom') {
      return this.authService.canTransfer();
    } else if (this.data.accountType === 'transferTo') {
      // For transfer to, we might want different permission checks
      return this.authService.canTransfer();
    }
   
    return true;
  }
 
  /**
   * Get user approval level based on role
   */
  private getUserApprovalLevel(userRole: string): number {
    if (!userRole) return 0;
   
    const roleUpper = userRole.toUpperCase();
    switch (roleUpper) {
      case 'ADMIN':
        return 4;
      case 'APPROVER':
        return 3;
      case 'CHECKER':
        return 2;
      case 'MAKER':
        return 1;
      case 'VIEWER':
        return 0;
      case 'USER':
        return 1; // Default USER level
      default:
        return 0;
    }
  }
 
  /**
   * Format currency with locale
   */
  formatCurrency(amount: number | undefined, currency: string): string {
    if (amount === undefined || amount === null) {
      return `${currency || 'PKR'} 0.00`;
    }
   
    try {
      // Handle different currencies
      const currencyCode = currency === 'PKR' ? 'PKR' :
                          currency === 'USD' ? 'USD' :
                          currency === 'EUR' ? 'EUR' :
                          currency || 'PKR';
     
      // For PKR, we'll format with Pakistani locale
      if (currencyCode === 'PKR') {
        return new Intl.NumberFormat('en-PK', {
          style: 'currency',
          currency: 'PKR',
          currencyDisplay: 'code',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(amount).replace('PKR', 'PKR ');
      }
     
      // For other currencies
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (e) {
      return `${currency || 'PKR'} ${amount.toFixed(2)}`;
    }
  }
 
  /**
   * Mask account number for display (shows last 4 digits)
   */
  maskAccountNumber(accountNumber: string): string {
    if (!accountNumber || accountNumber.length <= 4) {
      return accountNumber;
    }
    const lastFour = accountNumber.slice(-4);
    return `••••${lastFour}`;
  }
 
  /**
   * Get approval level display name
   */
  getApprovalLevelDisplay(level: number | undefined): string {
    if (level === undefined || level === null) return 'Not specified';
   
    switch (level) {
      case 0: return 'Viewer';
      case 1: return 'Maker (Level 1)';
      case 2: return 'Checker (Level 2)';
      case 3: return 'Approver (Level 3)';
      case 4: return 'Admin (Level 4)';
      default: return `Level ${level}`;
    }
  }
 
  /**
   * Get status color
   */
  getStatusColor(status: string | boolean | undefined): string {
    if (typeof status === 'boolean') {
      return status ? 'status-active' : 'status-inactive';
    }
   
    if (!status) return 'status-unknown';
   
    const statusStr = String(status).toLowerCase();
    if (statusStr === 'active' || statusStr === 'true') {
      return 'status-active';
    } else if (statusStr === 'inactive' || statusStr === 'false') {
      return 'status-inactive';
    } else if (statusStr === 'dormant') {
      return 'status-dormant';
    } else if (statusStr === 'closed') {
      return 'status-closed';
    }
    return 'status-unknown';
  }
 
  /**
   * Get status display text
   */
  getStatusDisplay(status: string | boolean | undefined): string {
    if (typeof status === 'boolean') {
      return status ? 'Active' : 'Inactive';
    }
   
    if (!status) return 'Unknown';
   
    const statusStr = String(status);
    return statusStr.charAt(0).toUpperCase() + statusStr.slice(1).toLowerCase();
  }
 
  /**
   * Check if account has IBAN
   */
  hasIban(account: BaseAccount): boolean {
    return !!(account.iban && account.iban.trim().length > 0);
  }
 
  /**
   * Check if account has branch info
   */
  hasBranch(account: BaseAccount): boolean {
    return !!(account.branch && account.branch.trim().length > 0);
  }
 
  /**
   * Get account type display with proper casing
   */
  getAccountTypeDisplay(type: string): string {
    if (!type) return 'Unknown';
   
    const typeLower = type.toLowerCase();
    switch (typeLower) {
      case 'savings':
        return 'Savings';
      case 'current':
        return 'Current';
      case 'checking':
        return 'Checking';
      case 'business':
        return 'Business';
      case 'corporate':
        return 'Corporate';
      case 'personal':
        return 'Personal';
      case 'foreign':
        return 'Foreign';
      default:
        // Capitalize first letter
        return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    }
  }
 
  /**
   * Check if user needs dual authorization for this account
   */
  requiresDualAuth(account: BaseAccount): boolean {
    return !!account.requiresDualAuthorization;
  }
 
  /**
   * Get access policy display
   */
  getAccessPolicyDisplay(policyType: string): string {
    if (!policyType) return 'Default';
   
    switch (policyType.toUpperCase()) {
      case 'PUBLIC':
        return 'Public Access';
      case 'ROLE_BASED':
        return 'Role-Based';
      case 'RESTRICTED':
        return 'Restricted';
      case 'ADMIN_ONLY':
        return 'Admin Only';
      default:
        return policyType;
    }
  }
}