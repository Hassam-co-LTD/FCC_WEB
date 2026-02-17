import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../../../core/services/api.service';
import Swal from 'sweetalert2';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTabsModule, MatIconModule, RouterLink],
  templateUrl: './company-list.html',
  styleUrls: ['./company-list.scss']
})
export class CompanyList implements OnInit {

  selectedTabIndex = 0;

  draftCompany: any[] = [];
  approvedCompany: any[] = [];
  submittedCompany: any[] = [];

  storeFilteredDraftCompany: any[] = [];
  storeFilteredApprovedCompany: any[] = [];
  storeFilteredSubmittedCompany: any[] = [];

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
    if (index === 0) this.loadDraftCompany();
    else if (index === 1) this.loadApprovedCompany();
    else if (index === 2) this.loadSubmittedCompany();

    this.searchText = '';
  }

  // ================== Load Company ==================
  loadDraftCompany() {
    this.api.getTnxByStatus('I','company').subscribe({
      next: res => {
        console.log('Draft Company response:', res);
        this.draftCompany = res;
        this.storeFilteredDraftCompany = [...res];  
      },
      error: err => console.error('Error fetching draft Company', err)
    });
  }

  loadApprovedCompany() {
    this.api.getTnxByStatus('A','company').subscribe({
      next: res => {
        this.approvedCompany = res;
        this.storeFilteredApprovedCompany = [...res];
      },
      error: err => console.error('Error fetching approved Company', err)
    });
  }

  loadSubmittedCompany() {
    this.api.getTnxByStatus('S','company').subscribe({
      next: res => {
        this.submittedCompany = res;
        this.storeFilteredSubmittedCompany = [...res];
      },
      error: err => console.error('Error fetching submitted Company', err)
    });
  }

  // ================== Filter Company ==================
  filterDraftCompany(search: string) {
    if (!search) { this.storeFilteredDraftCompany = [...this.draftCompany]; return; }
    const value = search.toLowerCase();
    this.storeFilteredDraftCompany = this.draftCompany.filter(c =>
      c.companyId?.toLowerCase().includes(value) ||
      c.companyName?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  filterApprovedCompany(search: string) {
    if (!search) { this.storeFilteredApprovedCompany = [...this.approvedCompany]; return; }
    const value = search.toLowerCase();
    this.storeFilteredApprovedCompany = this.approvedCompany.filter(c =>
      c.companyId?.toLowerCase().includes(value) ||
      c.companyName?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  filterSubmittedCompany(search: string) {
    if (!search) { this.storeFilteredSubmittedCompany = [...this.submittedCompany]; return; }
    const value = search.toLowerCase();
    this.storeFilteredSubmittedCompany = this.submittedCompany.filter(c =>
      c.companyId?.toLowerCase().includes(value) ||
      c.companyName?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  // ================== Actions ==================
  updateRouter(customer: any) {
    this.router.navigate(['/admin/create-company/' + customer.id]);
  }

  submitStatus(id: number) {
    this.api.setTnxByStatus('S', id, 'company').subscribe({
      next: (res) => {
        console.log('Submit response:', res);
        Swal.fire('Success', 'Company submitted successfully', 'success');
        this.loadDraftCompany();
        this.loadSubmittedCompany();
      },
      error: err => Swal.fire('Error', 'Failed to submit company', 'error')
    });
  }

  setApprove(id: number) {
    this.api.setTnxByStatus('A', id, 'company').subscribe({
      next: () => {
        Swal.fire('Success', 'Company approved successfully', 'success');
        this.loadSubmittedCompany();
        this.loadApprovedCompany();
      },
      error: err => Swal.fire('Error', 'Failed to approve company', 'error')
    });
  }

  Reject(id: number) {
    this.api.setTnxByStatus('R', id, 'company').subscribe({
      next: () => {
        Swal.fire('Success', 'Company rejected successfully', 'success');
        this.loadSubmittedCompany();
      },
      error: err => Swal.fire('Error', 'Failed to reject company', 'error')
    });
  }

  /** ================== Edit Approved Customer ================== */
  editApprovedCustomer(id: number) {
    // Move approved company back to Draft for editing
    this.api.setTnxByStatus('I', id, 'company').subscribe({
      next: () => {
        Swal.fire('Success', 'Approved company moved to Draft for editing', 'success');
        // Reload all tabs
        this.loadDraftCompany();
        this.loadApprovedCompany();
      },
      error: err => Swal.fire('Error', 'Failed to move approved company to draft', 'error')
    });
  }

  // ================== Track By ==================
  trackById(index: number, item: any) {
    return item.id;
  }

  // ================== Counts ==================
  get draftCount(): number { return this.draftCompany.length; }
  get approvedCount(): number { return this.approvedCompany.length; }
  get submittedCount(): number { return this.submittedCompany.length; }

  get filteredDraftCount(): number { return this.storeFilteredDraftCompany.length; }
  get filteredApprovedCount(): number { return this.storeFilteredApprovedCompany.length; }
  get filteredSubmittedCount(): number { return this.storeFilteredSubmittedCompany.length; }
}
