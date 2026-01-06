import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../../../core/services/api.service';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-customer-status',
  standalone: true,
  templateUrl: './customer-list.html',
  styleUrls: ['./customer-list.scss'],
  imports: [CommonModule, MatTabsModule, FormsModule, ReactiveFormsModule, MatIconModule]
})
export class CustomerList implements OnInit {

  selectedTabIndex = 0;

  draftCustomers: any[] = [];
  approvedCustomers: any[] = [];
  submittedCustomers: any[] = [];

  searchText: string = '';

  storeFilteredDraftCustomers: any[] = [];
  storeFilteredApprovedCustomers: any[] = [];
  storeFilteredSubmittedCustomers: any[] = [];

  selectedId: any = null;
  checkActionId: any = null;

  editingMode: number | null = null;
  editingCustomer: any = null;
  savingCustomer: any = null;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const tab = params['tabName'];

      if (tab === 'submitted') {
        this.selectedTabIndex = 2;
        this.loadSubmittedCustomers();
      } else if (tab === 'approved') {
        this.selectedTabIndex = 1;
        this.loadApprovedCustomers();
      } else {
        this.selectedTabIndex = 0;
        this.loadDraftCustomers();
      }
    });
  }

  /** ================== Tab Change ================== */
  onTabChange(index: number) {
    this.selectedTabIndex = index;

    if (index === 0) this.loadDraftCustomers();
    else if (index === 1) this.loadApprovedCustomers();
    else if (index === 2) this.loadSubmittedCustomers();

    this.searchText = ''; // clear search on tab change
  }

  /** ================== Load Customers ================== */
  loadDraftCustomers() {
    this.api.getCustomersByStatus('D').subscribe({
      next: res => {
        this.draftCustomers = res;
        this.storeFilteredDraftCustomers = [...res];
      },
      error: err => console.log('Error fetching draft customers', err)
    });
  }

  loadApprovedCustomers() {
    this.api.getApprovedCustomers().subscribe({
      next: res => {
        this.approvedCustomers = res;
        this.storeFilteredApprovedCustomers = [...res];
      },
      error: err => console.log('Error fetching approved customers', err)
    });
  }

  loadSubmittedCustomers() {
    this.api.getSubmittedCustomers().subscribe({
      next: res => {
        this.submittedCustomers = res;
        this.storeFilteredSubmittedCustomers = [...res];
      },
      error: err => console.log('Error fetching submitted customers', err)
    });
  }

  /** ================== Filter Customers ================== */
  filterDraftCustomers(search: string) {
    if (!search) {
      this.storeFilteredDraftCustomers = [...this.draftCustomers];
      return;
    }
    const value = search.toLowerCase();
    this.storeFilteredDraftCustomers = this.draftCustomers.filter(c => c.cId.toLowerCase().includes(value));
  }

  filterApprovedCustomers(search: string) {
    if (!search) {
      this.storeFilteredApprovedCustomers = [...this.approvedCustomers];
      return;
    }
    const value = search.toLowerCase();
    this.storeFilteredApprovedCustomers = this.approvedCustomers.filter(c => c.cId.toLowerCase().includes(value));
  }

  filterSubmittedCustomers(search: string) {
    if (!search) {
      this.storeFilteredSubmittedCustomers = [...this.submittedCustomers];
      return;
    }
    const value = search.toLowerCase();
    this.storeFilteredSubmittedCustomers = this.submittedCustomers.filter(c => c.cId.toLowerCase().includes(value));
  }

  /** ================== Actions ================== */
  clickOnLegalId(id: any) {
    this.selectedId = id;
    this.checkActionId = id;
  }

  editCustomer(customer: any) {
    this.editingMode = customer.legalId;
    this.editingCustomer = { ...customer };
    this.savingCustomer = customer.legalId;
  }

  submitCustomer(id: any) {
    // implement submit logic
  }

  onCancel(customer: any) {
    Object.assign(customer, this.editingCustomer); // restore old values
    this.selectedId = null;                          // exit edit mode
    this.savingCustomer = null;
  }

  updateRouter(customer: any) {
    this.router.navigate(['/admin/create-customer/' + customer.id]);
  }

  /** ================== Track By ================== */
  trackById(index: number, item: any) {
    return item.id;
  }

  /** ================== Counts ================== */
  get draftCount(): number {
    return this.draftCustomers.length;
  }

  get approvedCount(): number {
    return this.approvedCustomers.length;
  }

  get submittedCount(): number {
    return this.submittedCustomers.length;
  }

  get filteredDraftCount(): number {
    return this.storeFilteredDraftCustomers.length;
  }

  get filteredApprovedCount(): number {
    return this.storeFilteredApprovedCustomers.length;
  }

  get filteredSubmittedCount(): number {
    return this.storeFilteredSubmittedCustomers.length;
  }
}
