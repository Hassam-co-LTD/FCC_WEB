import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../../../../core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-currency-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
  ],
  templateUrl: './currency-list.html',
  styleUrls: ['./currency-list.scss']
})
export class CurrencyList implements OnInit {

  selectedTabIndex = 0;

  // ================== Data Stores ==================
  draftCurrencies: any[] = [];
  approvedCurrencies: any[] = [];
  submittedCurrencies: any[] = [];

  storeFilteredDraftCurrencies: any[] = [];
  storeFilteredApprovedCurrencies: any[] = [];
  storeFilteredSubmittedCurrencies: any[] = [];

  searchText: string = '';

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  // ================== Init ==================
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

    if (index === 0) this.loadDraftCurrencies();
    else if (index === 1) this.loadApprovedCurrencies();
    else if (index === 2) this.loadSubmittedCurrencies();

    this.searchText = '';
  }

  // ================== API Calls ==================
  loadDraftCurrencies() {
    this.api.getTnxByStatus('I', 'currency').subscribe({
      next: res => {
        this.draftCurrencies = res;
        this.storeFilteredDraftCurrencies = [...res];
      },
      error: err => console.error('Error fetching draft currencies', err)
    });
  }

  loadApprovedCurrencies() {
    this.api.getTnxByStatus('A', 'currency').subscribe({
      next: res => {
        this.approvedCurrencies = res;
        this.storeFilteredApprovedCurrencies = [...res];
      },
      error: err => console.error('Error fetching approved currencies', err)
    });
  }

  loadSubmittedCurrencies() {
    this.api.getTnxByStatus('S', 'currency').subscribe({
      next: res => {
        this.submittedCurrencies = res;
        this.storeFilteredSubmittedCurrencies = [...res];
      },
      error: err => console.error('Error fetching submitted currencies', err)
    });
  }

  // ================== Filters ==================
  filterDraftCurrencies(search: string) {
    if (!search) {
      this.storeFilteredDraftCurrencies = [...this.draftCurrencies];
      return;
    }

    const value = search.toLowerCase();

    this.storeFilteredDraftCurrencies = this.draftCurrencies.filter(c =>
      c.currencyId?.toLowerCase().includes(value) ||
      c.currencyCode?.toLowerCase().includes(value) ||
      c.currencyDesc?.toLowerCase().includes(value) ||
      c.currencyMapId?.toLowerCase().includes(value)
    );
  }

  filterApprovedCurrencies(search: string) {
    if (!search) {
      this.storeFilteredApprovedCurrencies = [...this.approvedCurrencies];
      return;
    }

    const value = search.toLowerCase();

    this.storeFilteredApprovedCurrencies = this.approvedCurrencies.filter(c =>
      c.currencyId?.toLowerCase().includes(value) ||
      c.currencyCode?.toLowerCase().includes(value) ||
      c.currencyDesc?.toLowerCase().includes(value) ||
      c.currencyMapId?.toLowerCase().includes(value)
    );
  }

  filterSubmittedCurrencies(search: string) {
    if (!search) {
      this.storeFilteredSubmittedCurrencies = [...this.submittedCurrencies];
      return;
    }

    const value = search.toLowerCase();

    this.storeFilteredSubmittedCurrencies = this.submittedCurrencies.filter(c =>
      c.currencyId?.toLowerCase().includes(value) ||
      c.currencyCode?.toLowerCase().includes(value) ||
      c.currencyDesc?.toLowerCase().includes(value) ||
      c.currencyMapId?.toLowerCase().includes(value)
    );
  }

  // ================== Navigation ==================
  updateRouter(currencyId: string) {
    this.router.navigate(['/admin/create-currency/' + currencyId]);
  }

  // ================== Status Actions ==================
  submitStatus(id: number) {
    this.api.setTnxByStatus('S', id, 'currency').subscribe({
      next: () => {
        Swal.fire('Success', 'Currency submitted successfully', 'success');
        this.loadDraftCurrencies();
        this.loadSubmittedCurrencies();
      },
      error: () => Swal.fire('Error', 'Failed to submit currency', 'error')
    });
  }

  setApprove(id: number) {
    this.api.setTnxByStatus('A', id, 'currency').subscribe({
      next: () => {
        Swal.fire('Success', 'Currency approved successfully', 'success');
        this.loadSubmittedCurrencies();
        this.loadApprovedCurrencies();
      },
      error: () => Swal.fire('Error', 'Failed to approve currency', 'error')
    });
  }

  reject(id: number) {
    this.api.setTnxByStatus('R', id, 'currency').subscribe({
      next: () => {
        Swal.fire('Success', 'Currency rejected successfully', 'success');
        this.loadSubmittedCurrencies();
      },
      error: () => Swal.fire('Error', 'Failed to reject currency', 'error')
    });
  }

  editApprovedCurrency(id: number) {
    this.api.setTnxByStatus('D', id, 'currency').subscribe({
      next: () => {
        Swal.fire('Success', 'Moved to Draft for editing', 'success');
        this.loadDraftCurrencies();
        this.loadApprovedCurrencies();
      },
      error: () => Swal.fire('Error', 'Failed to move currency', 'error')
    });
  }

  // ================== Track By ==================
  trackById(index: number, item: any) {
    return item.currencyId;
  }

  // ================== Counts ==================
  get draftCount(): number {
    return this.draftCurrencies.length;
  }

  get approvedCount(): number {
    return this.approvedCurrencies.length;
  }

  get submittedCount(): number {
    return this.submittedCurrencies.length;
  }

  get filteredDraftCount(): number {
    return this.storeFilteredDraftCurrencies.length;
  }

  get filteredApprovedCount(): number {
    return this.storeFilteredApprovedCurrencies.length;
  }

  get filteredSubmittedCount(): number {
    return this.storeFilteredSubmittedCurrencies.length;
  }
}