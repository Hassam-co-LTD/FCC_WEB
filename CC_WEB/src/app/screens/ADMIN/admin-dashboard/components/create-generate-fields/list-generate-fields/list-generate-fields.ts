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
  templateUrl: './list-generate-fields.html',
  styleUrls: ['./list-generate-fields.scss']
})
export class ListGenerateFields implements OnInit {

  selectedTabIndex = 0;

  draftFields: any[] = [];
  approvedFields: any[] = [];
  submittedFields: any[] = [];

  storeFilteredDraftFields: any[] = [];
  storeFilteredApprovedFields: any[] = [];
  storeFilteredSubmittedFields: any[] = [];

  searchText: string = '';

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const tab = params['tabName'];
      if (tab === 'Submitted') this.onTabChange(2);
      else if (tab === 'Approved') this.onTabChange(1);
      else this.onTabChange(0);
    });
  }

  // ================== Tab Change ==================
  onTabChange(index: number) {
    this.selectedTabIndex = index;

    if (index === 0) this.loadDraftFields();
    else if (index === 1) this.loadApprovedFields();
    else if (index === 2) this.loadSubmittedFields();

    this.searchText = '';
  }

  // ================== Load Fields ==================
  loadDraftFields() {
    this.api.getTnxByStatus('I','dynamic-fields').subscribe({
      next: res => {
        console.log('Draft fields response:', res);
        this.draftFields = res;
        this.storeFilteredDraftFields = [...res];  
      },
      error: err => console.error('Error fetching draft fields', err)
    });
  }

  loadApprovedFields() {
    this.api.getTnxByStatus('A','dynamic-fields').subscribe({
      next: res => {
        this.approvedFields = res;
        this.storeFilteredApprovedFields   = [...res];
      },
      error: err => console.error('Error fetching approved fields', err)
    });
  }

  loadSubmittedFields() {
    this.api.getTnxByStatus('S','dynamic-fields').subscribe({
      next: res => {
        this.submittedFields = res;
        this.storeFilteredSubmittedFields = [...res];
      },
      error: err => console.error('Error fetching submitted fields', err)
    });
  }

  // ================== Filter Fields ==================
  filterDraftFields(search: string) {
    if (!search) { this.storeFilteredDraftFields = [...this.draftFields]; return; }
    const value = search.toLowerCase();
    this.storeFilteredDraftFields = this.draftFields.filter(f =>
      f.fieldName?.toLowerCase().includes(value) ||
      f.fieldType?.toLowerCase().includes(value)
    );
  }

  filterApprovedFields(search: string) {
    if (!search) { this.storeFilteredApprovedFields = [...this.approvedFields]; return; }
    const value = search.toLowerCase();
    this.storeFilteredApprovedFields = this.approvedFields.filter(f =>
      f.fieldName?.toLowerCase().includes(value) ||
      f.fieldType?.toLowerCase().includes(value)
    );
  }

  filterSubmittedFields(search: string) {
    if (!search) { this.storeFilteredSubmittedFields = [...this.submittedFields]; return; }
    const value = search.toLowerCase();
    this.storeFilteredSubmittedFields = this.submittedFields.filter(f =>
      f.fieldName?.toLowerCase().includes(value) ||
      f.fieldType?.toLowerCase().includes(value)
    );
  }

  // ================== Actions ==================
  updateRouter(field: any) {
    this.router.navigate(['/admin/create-field/' + field.id]);
  }

  submitStatus(id: number) {
    this.api.setTnxByStatus('S', id, 'dynamic-fields').subscribe({
      next: () => {
        Swal.fire('Success', 'Field submitted successfully', 'success');
        this.loadDraftFields();
        this.loadSubmittedFields();
      },
      error: err => Swal.fire('Error', 'Failed to submit field', 'error')
    });
  }
  
  setApprove(id: number) {
    this.api.setTnxByStatus('A', id, 'dynamic-fields').subscribe({
      next: () => {
        Swal.fire('Success', 'Field approved successfully', 'success');
        this.loadSubmittedFields();
        this.loadApprovedFields();
      },
      error: err => Swal.fire('Error', 'Failed to approve field', 'error')
    });
  }

  Reject(id: number) {
    this.api.setTnxByStatus('R', id, 'dynamic-fields').subscribe({
      next: () => {
        Swal.fire('Success', 'Field rejected successfully', 'success');
        this.loadSubmittedFields();
      },
      error: err => Swal.fire('Error', 'Failed to reject field', 'error')
    });
  }

  /** ================== Edit Approved Field ================== */
  editApprovedField(id: number) {
    // Move approved field back to Draft for editing
    this.api.setTnxByStatus('D', id, 'dynamic-fields').subscribe({
      next: () => {
        Swal.fire('Success', 'Approved field moved to Draft for editing', 'success');
        // Reload all tabs
        this.loadDraftFields();
        this.loadApprovedFields();
      },
      error: err => Swal.fire('Error', 'Failed to move approved field to draft', 'error')
    });
  }

  // ================== Track By ==================
  trackById(index: number, item: any) {
    return item.id;
  }

  // ================== Counts ==================
  get draftCount(): number { return this.draftFields.length; }
  get approvedCount(): number { return this.approvedFields.length; }
  get submittedCount(): number { return this.submittedFields.length; }

  get filteredDraftCount(): number { return this.storeFilteredDraftFields.length; }
  get filteredApprovedCount(): number { return this.storeFilteredApprovedFields.length; }
  get filteredSubmittedCount(): number { return this.storeFilteredSubmittedFields .length; }
}
