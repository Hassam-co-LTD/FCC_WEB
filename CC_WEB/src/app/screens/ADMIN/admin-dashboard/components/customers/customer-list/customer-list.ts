import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../../../core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTabsModule, MatIconModule],
  templateUrl: './customer-list.html',
  styleUrls: ['./customer-list.scss']
})
export class CustomerList implements OnInit {

  selectedTabIndex = 0;

  draftCustomers: any[] = [];
  approvedCustomers: any[] = [];
  submittedCustomers: any[] = [];

  storeFilteredDraftCustomers: any[] = [];
  storeFilteredApprovedCustomers: any[] = [];
  storeFilteredSubmittedCustomers: any[] = [];

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
    if (index === 0) this.loadDraftCustomers();
    else if (index === 1) this.loadApprovedCustomers();
    else if (index === 2) this.loadSubmittedCustomers();

    this.searchText = '';
  }

  // ================== Load Customers ==================
  loadDraftCustomers() {
    this.api.getTnxByStatus('D','customer').subscribe({
      next: res => {
        this.draftCustomers = res;
        this.storeFilteredDraftCustomers = [...res];
      },
      error: err => console.error('Error fetching draft customers', err)
    });
  }

  loadApprovedCustomers() {
    this.api.getTnxByStatus('A','customer').subscribe({
      next: res => {
        this.approvedCustomers = res;
        this.storeFilteredApprovedCustomers = [...res];
      },
      error: err => console.error('Error fetching approved customers', err)
    });
  }

  loadSubmittedCustomers() {
    this.api.getTnxByStatus('S','customer').subscribe({
      next: res => {
        this.submittedCustomers = res;
        this.storeFilteredSubmittedCustomers = [...res];
      },
      error: err => console.error('Error fetching submitted customers', err)
    });
  }

  // ================== Filter Customers ==================
  filterDraftCustomers(search: string) {
    if (!search) { this.storeFilteredDraftCustomers = [...this.draftCustomers]; return; }
    const value = search.toLowerCase();
    this.storeFilteredDraftCustomers = this.draftCustomers.filter(c =>
      c.cId?.toLowerCase().includes(value) ||
      c.name?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  filterApprovedCustomers(search: string) {
    if (!search) { this.storeFilteredApprovedCustomers = [...this.approvedCustomers]; return; }
    const value = search.toLowerCase();
    this.storeFilteredApprovedCustomers = this.approvedCustomers.filter(c =>
      c.cId?.toLowerCase().includes(value) ||
      c.name?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  filterSubmittedCustomers(search: string) {
    if (!search) { this.storeFilteredSubmittedCustomers = [...this.submittedCustomers]; return; }
    const value = search.toLowerCase();
    this.storeFilteredSubmittedCustomers = this.submittedCustomers.filter(c =>
      c.cId?.toLowerCase().includes(value) ||
      c.name?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  // ================== Actions ==================
  updateRouter(customer: any) {
    this.router.navigate(['/admin/create-customer/' + customer.id]);
  }

  submitStatus(id: number) {
    this.api.setTnxByStatus('S', id).subscribe({
      next: () => {
        Swal.fire('Success', 'Customer submitted successfully', 'success');
        this.loadDraftCustomers();
        this.loadSubmittedCustomers();
      },
      error: err => Swal.fire('Error', 'Failed to submit customer', 'error')
    });
  }

  setApprove(id: number) {
    this.api.setTnxByStatus('A', id).subscribe({
      next: () => {
        Swal.fire('Success', 'Customer approved successfully', 'success');
        this.loadSubmittedCustomers();
        this.loadApprovedCustomers();
      },
      error: err => Swal.fire('Error', 'Failed to approve customer', 'error')
    });
  }

  Reject(id: number) {
    this.api.setTnxByStatus('R', id).subscribe({
      next: () => {
        Swal.fire('Success', 'Customer rejected successfully', 'success');
        this.loadSubmittedCustomers();
      },
      error: err => Swal.fire('Error', 'Failed to reject customer', 'error')
    });
  }

  /** ================== Edit Approved Customer ================== */
  editApprovedCustomer(id: number) {
    // Move approved customer back to Draft for editing
    this.api.setTnxByStatus('D', id).subscribe({
      next: () => {
        Swal.fire('Success', 'Approved customer moved to Draft for editing', 'success');
        // Reload all tabs
        this.loadDraftCustomers();
        this.loadApprovedCustomers();
      },
      error: err => Swal.fire('Error', 'Failed to move approved customer to draft', 'error')
    });
  }

  // ================== Track By ==================
  trackById(index: number, item: any) {
    return item.id;
  }

  // ================== Counts ==================
  get draftCount(): number { return this.draftCustomers.length; }
  get approvedCount(): number { return this.approvedCustomers.length; }
  get submittedCount(): number { return this.submittedCustomers.length; }

  get filteredDraftCount(): number { return this.storeFilteredDraftCustomers.length; }
  get filteredApprovedCount(): number { return this.storeFilteredApprovedCustomers.length; }
  get filteredSubmittedCount(): number { return this.storeFilteredSubmittedCustomers.length; }
}
