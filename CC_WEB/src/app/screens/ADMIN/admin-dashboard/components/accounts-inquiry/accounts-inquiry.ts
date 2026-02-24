import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../../core/services/api.service';
import Swal from 'sweetalert2';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-accounts-inquiry',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTabsModule, MatIconModule, RouterLink],
  templateUrl: './accounts-inquiry.html',
  styleUrls: ['./accounts-inquiry.scss']
})
export class AccountsInquiry implements OnInit {

  selectedTabIndex = 0;

  draftAccounts: any[] = [];
  approvedAccounts: any[] = [];
  submittedAccounts: any[] = [];

  storeFilteredDraftAccounts: any[] = [];
  storeFilteredApprovedAccounts: any[] = [];
  storeFilteredSubmittedAccounts: any[] = [];

  searchText: string = '';

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const tab = params['tabName'];
      if (tab === 'submitted') this.onTabChange(2);
      else if (tab === 'approved') this.onTabChange(1);
      else this.onTabChange(0);
    });
  }

  // ================== Tab Change ==================
  onTabChange(index: number) {
    this.selectedTabIndex = index;
    if (index === 0) this.loadDraftAccounts();
    else if (index === 1) this.loadApprovedAccounts();
    else if (index === 2) this.loadSubmittedAccounts();

    this.searchText = '';
  }

  // ================== Load Accounts ==================
  loadDraftAccounts() {
    this.api.getTnxByStatus('I','accounts').subscribe({
      next: res => {
        console.log('Draft Accounts response:', res);
        this.draftAccounts = res;
        this.storeFilteredDraftAccounts = [...res];  
      },
      error: err => console.error('Error fetching draft Accounts', err)
    });
  }

  loadApprovedAccounts() {
    this.api.getTnxByStatus('A','accounts').subscribe({
      next: res => {
        this.approvedAccounts = res;
        this.storeFilteredApprovedAccounts = [...res];
      },
      error: err => console.error('Error fetching approved Accounts', err)
    });
  }

  loadSubmittedAccounts() {
    this.api.getTnxByStatus('S','accounts').subscribe({
      next: res => {
        this.submittedAccounts = res;
        this.storeFilteredSubmittedAccounts = [...res];
      },
      error: err => console.error('Error fetching submitted Accounts', err)
    });
  }

  // ================== Filter Accounts ==================
  filterDraftAccounts(search: string) {
    if (!search) { this.storeFilteredDraftAccounts = [...this.draftAccounts]; return; }
    const value = search.toLowerCase();
    this.storeFilteredDraftAccounts = this.draftAccounts.filter(c =>
      c.cId?.toLowerCase().includes(value) ||
      c.name?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  filterApprovedAccounts(search: string) {
    if (!search) { this.storeFilteredApprovedAccounts = [...this.approvedAccounts]; return; }
    const value = search.toLowerCase();
    this.storeFilteredApprovedAccounts = this.approvedAccounts.filter(c =>
      c.cId?.toLowerCase().includes(value) ||
      c.name?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  filterSubmittedAccounts(search: string) {
    if (!search) { this.storeFilteredSubmittedAccounts = [...this.submittedAccounts]; return; }
    const value = search.toLowerCase();
    this.storeFilteredSubmittedAccounts = this.submittedAccounts.filter(c =>
      c.cId?.toLowerCase().includes(value) ||
      c.name?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  // ================== Actions ==================
  updateRouter(customer: any) {
    this.router.navigate(['/admin/create-account/' + customer.id]);
  }

  submitStatus(id: number) {
    this.api.setTnxByStatus('S', id, 'accounts').subscribe({
      next: () => {
        Swal.fire('Success', 'Account submitted successfully', 'success');
        this.loadDraftAccounts();
        this.loadSubmittedAccounts();
      },
      error: err => Swal.fire('Error', 'Failed to submit account', 'error')
    });
  }

  setApprove(id: number) {
    this.api.setTnxByStatus('A', id, 'accounts').subscribe({
      next: () => {
        Swal.fire('Success', 'Account approved successfully', 'success');
        this.loadSubmittedAccounts();
        this.loadApprovedAccounts();
      },
      error: err => Swal.fire('Error', 'Failed to approve account', 'error')
    });
  }

  Reject(id: number) {
    this.api.setTnxByStatus('R', id, 'accounts').subscribe({
      next: () => {
        Swal.fire('Success', 'Account rejected successfully', 'success');
        this.loadSubmittedAccounts();
      },
      error: err => Swal.fire('Error', 'Failed to reject account', 'error')
    });
  }

  /** ================== Edit Approved Customer ================== */
  editApprovedCustomer(id: number) {
    // Move approved customer back to Draft for editing
    this.api.setTnxByStatus('D', id, 'accounts').subscribe({
      next: () => {
        Swal.fire('Success', 'Approved account moved to Draft for editing', 'success');
        // Reload all tabs  
        this.loadDraftAccounts();
        this.loadApprovedAccounts();
      },
      error: err => Swal.fire('Error', 'Failed to move approved account to draft', 'error')
    });
  } 

  // ================== Track By ==================
  trackById(index: number, item: any) {
    return item.id;
  }

  // ================== Counts ==================
  get draftCount(): number { return this.draftAccounts.length; }
  get approvedCount(): number { return this.approvedAccounts.length; }
  get submittedCount(): number { return this.submittedAccounts.length; }

  get filteredDraftCount(): number { return this.storeFilteredDraftAccounts.length; }
  get filteredApprovedCount(): number { return this.storeFilteredApprovedAccounts.length; }
  get filteredSubmittedCount(): number { return this.storeFilteredSubmittedAccounts.length; }
}
