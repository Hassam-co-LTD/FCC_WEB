import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <--- Added for [(ngModel)]
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SharedService } from '../../../../../../core/services/user-service/shared-form-service/shared-service';
import { UndertakingIssuanceService } from '../../../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';

@Component({
  selector: 'app-pending-records',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './pending-records.html',
  styleUrls: ['./pending-records.scss']
})
export class PendingRecordsComponent implements OnInit {
  
  // Data State
  allTransactions: any[] = [];
  filteredTransactions: any[] = [];
  
  // UI State
  isLoading: boolean = false;
  activeTab: string = 'all'; 

  // Search State
  searchText: string = '';
  showAdvancedSearch: boolean = false;
  
  // Advanced Filter Model
  filters = {
    productType: '',
    applicant: '',
    beneficiary: '',
    currency: '',
    minAmount: null,
    maxAmount: null,
    dateFrom: '',
    dateTo: ''
  };

  tabs = [
    { key: 'all', label: 'All Transactions' },
    { key: 'draft', label: 'Drafts' },
    { key: 'Submitted', label: 'Submitted' } ,
    { key: 'Approve', label: 'Approve' },
    
  ];

  constructor(
    private backendService: UndertakingIssuanceService,
    private sharedService: SharedService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.loadData();
  }

  // ===========================================
  // 1. DATA LOADING
  // ============================================
  loadData() {
    this.isLoading = true;
    this.backendService.getTransactions().subscribe({
      next: (data) => {
        this.allTransactions = data;
        this.applyFilters(); // Initial Filter
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading transactions:', err);
        this.snackBar.open('Failed to load transactions.', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  // ============================================
  // 2. FILTERING LOGIC (Master Filter)
  // ============================================
  
  setActiveTab(key: string) {
    this.activeTab = key;
    this.applyFilters();
  }

  toggleAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  resetFilters() {
    this.searchText = '';
    this.filters = {
      productType: '',
      applicant: '',
      beneficiary: '',
      currency: '',
      minAmount: null,
      maxAmount: null,
      dateFrom: '',
      dateTo: ''
    };
    this.applyFilters();
  }

  // Count helper (ignores search text to show total available in tab)
  getTabCount(key: string): number {
    if (!this.allTransactions) return 0;
    return this.getTransactionsByTab(this.allTransactions, key).length;
  }

  /**
   * Master function that applies Tab Logic AND Search Logic
   */
  applyFilters() {
    if (!this.allTransactions) return;

    // 1. Filter by Tab first
    let temp = this.getTransactionsByTab(this.allTransactions, this.activeTab);

    // 2. Filter by Simple Search (Reference ID)
    if (this.searchText) {
      const term = this.searchText.toLowerCase();
      temp = temp.filter(t => 
        (t.channelReference && t.channelReference.toLowerCase().includes(term)) ||
        (t.id && t.id.toString().includes(term))
      );
    }

    // 3. Filter by Advanced Criteria
    if (this.showAdvancedSearch) {
      temp = temp.filter(t => {
        const d = t.formData; // Shortcut
        const general = d?.generalDetails;
        const undertaking = d?.undertakingDetails;
        const parties = d?.applicantBeneficiary;

        // Product Type
        if (this.filters.productType && general?.productType) {
          if (!general.productType.toLowerCase().includes(this.filters.productType.toLowerCase())) return false;
        }

        // Applicant
        if (this.filters.applicant && parties?.applicantName) {
          if (!parties.applicantName.toLowerCase().includes(this.filters.applicant.toLowerCase())) return false;
        }

        // Beneficiary
        if (this.filters.beneficiary && parties?.beneficiaryName) {
          if (!parties.beneficiaryName.toLowerCase().includes(this.filters.beneficiary.toLowerCase())) return false;
        }
        
        // Currency
        if (this.filters.currency && undertaking?.currency) {
            if (undertaking.currency !== this.filters.currency) return false;
        }

        // Amount Range
        const amt = undertaking?.undertakingAmount ? Number(undertaking.undertakingAmount) : 0;
        if (this.filters.minAmount !== null && amt < this.filters.minAmount) return false;
        if (this.filters.maxAmount !== null && amt > this.filters.maxAmount) return false;

        // Date Range (Expiry)
        if (undertaking?.expiryDate) {
          const expDate = new Date(undertaking.expiryDate).getTime();
          if (this.filters.dateFrom && expDate < new Date(this.filters.dateFrom).getTime()) return false;
          if (this.filters.dateTo && expDate > new Date(this.filters.dateTo).getTime()) return false;
        }

        return true;
      });
    }

    this.filteredTransactions = temp;
  }

  // Isolate Tab Logic for reusability
  private getTransactionsByTab(list: any[], key: string): any[] {
    switch (key) {
      case 'draft': return list.filter(t => t.status === 'Draft');
      case 'pending': return list.filter(t => t.status === 'Submitted' || t.status === 'Pending Approval');
      case 'processed': return list.filter(t => t.status === 'Approved' || t.status === 'Issued');
      default: return list; // 'all'
    }
  }

  // ============================================
  // 3. NAVIGATION (Unchanged)
  // ============================================
  handleTransactionClick(t: any) {
    this.sharedService.setFormData({
      isEditMode: true,
      transactionId: t.id,
      formData: t.formData,
      status: t.status,
      isReadOnly: (t.status === 'Approved' || t.status === 'Issued')
    });

    if (t.status === 'Draft' || !t.status) {
      this.router.navigate(['/undertaking-issuance/request'], { queryParams: { transactionId: t.id } });
    } else {
      this.router.navigate(['/undertaking-issuance/preview'], { queryParams: { transactionId: t.id } });
    }
  }

  navigateToView(t: any) {
    this.sharedService.setFormData({
      isEditMode: false,
      isReadOnly: true,
      transactionId: t.id,
      formData: t.formData
    });
    this.router.navigate(['/undertaking-issuance/preview'], { queryParams: { transactionId: t.id } });
  }

  approveTransaction(t: any, event: Event) {
    event.stopPropagation();
    if (confirm(`Are you sure you want to approve transaction ID: ${t.id}?`)) {
      this.isLoading = true;
      this.backendService.approveTransaction(t.id).subscribe({
        next: () => {
          this.snackBar.open('Approved Successfully', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
          this.loadData();
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open('Approval Failed', 'Close', { panelClass: ['error-snackbar'] });
        }
      });
    }
  }
}