import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../../../core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dynamic-field-options-inquiry',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTabsModule, MatIconModule, RouterLink],
  templateUrl: './dynamic-field-options-inquiry.html',
  styleUrls: ['./dynamic-field-options-inquiry.scss']
})
export class DynamicFieldOptionsInquiry implements OnInit {

  selectedTabIndex = 0;

  draftOptions: any[] = [];
  approvedOptions: any[] = [];
  submittedOptions: any[] = [];

  storeFilteredDraftOptions: any[] = [];
  storeFilteredApprovedOptions: any[] = [];
  storeFilteredSubmittedOptions: any[] = [];

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
    if (index === 0) this.loadDraftOptions();
    else if (index === 1) this.loadApprovedOptions();
    else if (index === 2) this.loadSubmittedOptions();

    this.searchText = '';
  }

  // ================== Load Options ==================
  loadDraftOptions() {
    this.api.getTnxByStatus('I', 'dropdown-values').subscribe({
      next: res => {
        this.draftOptions = res;
        this.storeFilteredDraftOptions = [...res];
        console.log('Draft options loaded:', res);
      },
      error: err => console.error('Error fetching draft options', err)
    });
  }

    loadApprovedOptions() {
      this.api.getTnxByStatus('A', 'dropdown-values').subscribe({
        next: res => {
          this.approvedOptions = res;
          this.storeFilteredApprovedOptions = [...res];
        },
        error: err => console.error('Error fetching approved options', err)
      });
    }

  loadSubmittedOptions() {
    this.api.getTnxByStatus('S', 'dropdown-values').subscribe({
      next: res => {
        this.submittedOptions = res;
        this.storeFilteredSubmittedOptions = [...res];
      },
      error: err => console.error('Error fetching submitted options', err)
    });
  }

  // ================== Filter Options ==================
  filterDraftOptions(search: string) {
    if (!search) { this.storeFilteredDraftOptions = [...this.draftOptions]; return; }
    const value = search.toLowerCase();
    this.storeFilteredDraftOptions = this.draftOptions.filter(o =>
      o.label?.toLowerCase().includes(value) ||
      o.screen?.toLowerCase().includes(value) ||
      o.type?.toLowerCase().includes(value)
    );
  }

  filterApprovedOptions(search: string) {
    if (!search) { this.storeFilteredApprovedOptions = [...this.approvedOptions]; return; }
    const value = search.toLowerCase();
    this.storeFilteredApprovedOptions = this.approvedOptions.filter(o =>
      o.label?.toLowerCase().includes(value) ||
      o.screen?.toLowerCase().includes(value) ||
      o.type?.toLowerCase().includes(value)
    );
  }

  filterSubmittedOptions(search: string) {
    if (!search) { this.storeFilteredSubmittedOptions = [...this.submittedOptions]; return; }
    const value = search.toLowerCase();
    this.storeFilteredSubmittedOptions = this.submittedOptions.filter(o =>
      o.label?.toLowerCase().includes(value) ||
      o.screen?.toLowerCase().includes(value) ||
      o.type?.toLowerCase().includes(value)
    );
  }

  // ================== Actions ==================
  submitStatus(id: number) {
    this.api.setTnxByStatus('S', id, 'dropdown-values').subscribe({
      next: () => {
        Swal.fire('Success', 'Option submitted successfully', 'success');
        this.loadDraftOptions();
        this.loadSubmittedOptions();
      },
      error: err => Swal.fire('Error', 'Failed to submit option', 'error')
    });
  }

  setApprove(id: number) {
    this.api.setTnxByStatus('A', id, 'dynamic-field-options').subscribe({
      next: () => {
        Swal.fire('Success', 'Option approved successfully', 'success');
        this.loadSubmittedOptions();
        this.loadApprovedOptions();
      },
      error: err => Swal.fire('Error', 'Failed to approve option', 'error')
    });
  }

  reject(id: number) {
    this.api.setTnxByStatus('I', id, 'dynamic-field-options').subscribe({
      next: () => {
        Swal.fire('Success', 'Option rejected successfully', 'success');
        this.loadSubmittedOptions();
      },
      error: err => Swal.fire('Error', 'Failed to reject option', 'error')
    });
  }

  editApprovedOption(id: number) {
    this.api.setTnxByStatus('I', id, 'dynamic-field-options').subscribe({
      next: () => {
        Swal.fire('Success', 'Approved option moved to Draft for editing', 'success');
        this.loadDraftOptions();
        this.loadApprovedOptions();
      },
      error: err => Swal.fire('Error', 'Failed to move approved option to draft', 'error')
    });
  }

  // ================== Track By ==================
  trackById(index: number, item: any) {
    return item.id;
  }

  // ================== Counts ==================
  get draftCount(): number { return this.draftOptions.length; }
  get approvedCount(): number { return this.approvedOptions.length; }
  get submittedCount(): number { return this.submittedOptions.length; }

  get filteredDraftCount(): number { return this.storeFilteredDraftOptions.length; }
  get filteredApprovedCount(): number { return this.storeFilteredApprovedOptions.length; }
  get filteredSubmittedCount(): number { return this.storeFilteredSubmittedOptions.length; }
}