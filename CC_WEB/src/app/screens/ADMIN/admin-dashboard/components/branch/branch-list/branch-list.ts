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
  templateUrl: './branch-list.html',
  styleUrls: ['./branch-list.scss']
})
export class BranchList implements OnInit {

  selectedTabIndex = 0;

  draftBranches: any[] = [];
  approvedBranches: any[] = [];
  submittedBranches: any[] = [];

  storeFilteredDraftBranches: any[] = [];
  storeFilteredApprovedBranches: any[] = [];
  storeFilteredSubmittedBranches: any[] = [];

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
    if (index === 0) this.loadDraftBranches();
    else if (index === 1) this.loadApprovedBranches();
    else if (index === 2) this.loadSubmittedBranches();

    this.searchText = '';
  }

  // ================== Load Branches ==================
  loadDraftBranches() {
    this.api.getTnxByStatus('I','branch').subscribe({
      next: res => {
        console.log('Draft branches response:', res);
        this.draftBranches = res;
        this.storeFilteredDraftBranches = [...res];  
      },
      error: err => console.error('Error fetching draft branches', err)
    });
  }

  loadApprovedBranches() {
    this.api.getTnxByStatus('A','branch').subscribe({
      next: res => {
        this.approvedBranches = res;
        this.storeFilteredApprovedBranches = [...res];
      },
      error: err => console.error('Error fetching approved branches', err)
    });
  }

  loadSubmittedBranches() {
    this.api.getTnxByStatus('S','branch').subscribe({
      next: res => {
        this.submittedBranches = res;
        this.storeFilteredSubmittedBranches = [...res];
      },
      error: err => console.error('Error fetching submitted branches', err)
    });
  }

  // ================== Filter Branches ==================
  filterDraftBranches(search: string) {
    if (!search) { this.storeFilteredDraftBranches = [...this.draftBranches]; return; }
    const value = search.toLowerCase();
    this.storeFilteredDraftBranches = this.draftBranches.filter(c =>
      c.cId?.toLowerCase().includes(value) ||
      c.name?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  filterApprovedBranches(search: string) {
    if (!search) { this.storeFilteredApprovedBranches = [...this.approvedBranches]; return; }
    const value = search.toLowerCase();
    this.storeFilteredApprovedBranches = this.approvedBranches.filter(c =>
      c.cId?.toLowerCase().includes(value) ||
      c.name?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  filterSubmittedBranches(search: string) {
    if (!search) { this.storeFilteredSubmittedBranches = [...this.submittedBranches]; return; }
    const value = search.toLowerCase();
    this.storeFilteredSubmittedBranches = this.submittedBranches.filter(c =>
      c.cId?.toLowerCase().includes(value) ||
      c.name?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  // ================== Actions ==================
  updateRouter(branch: any) {
    this.router.navigate(['/admin/create-branch/' + branch.id]);
  }

  submitStatus(id: number) {
    this.api.setTnxByStatus('S', id, 'branch').subscribe({
      next: () => {
        Swal.fire('Success', 'Branch submitted successfully', 'success');
        this.loadDraftBranches();
        this.loadSubmittedBranches();
      },
      error: err => Swal.fire('Error', 'Failed to submit branch', 'error')
    });
  }

  setApprove(id: number) {
    this.api.setTnxByStatus('A', id, 'branch').subscribe({
      next: () => {
        Swal.fire('Success', 'Branch approved successfully', 'success');
        this.loadSubmittedBranches();
        this.loadApprovedBranches();
      },
      error: err => Swal.fire('Error', 'Failed to approve branch', 'error')
    });
  }

  Reject(id: number) {
    this.api.setTnxByStatus('R', id, 'branch').subscribe({
      next: () => {
        Swal.fire('Success', 'Branch rejected successfully', 'success');
        this.loadSubmittedBranches();
      },
      error: err => Swal.fire('Error', 'Failed to reject branch', 'error')
    });
  }

  /** ================== Edit Approved Branch ================== */
  editApprovedBranch(id: number) {
    // Move approved branch back to Draft for editing
    this.api.setTnxByStatus('D', id, 'branch').subscribe({
      next: () => {
        Swal.fire('Success', 'Approved branch moved to Draft for editing', 'success');
        // Reload all tabs
        this.loadDraftBranches();
        this.loadApprovedBranches();
      },
      error: err => Swal.fire('Error', 'Failed to move approved branch to draft', 'error')
    });
  }

  // ================== Track By ==================
  trackById(index: number, item: any) {
    return item.id;
  }

  // ================== Counts ==================
  get draftCount(): number { return this.draftBranches.length; }
  get approvedCount(): number { return this.approvedBranches.length; }
  get submittedCount(): number { return this.submittedBranches.length; }

  get filteredDraftCount(): number { return this.storeFilteredDraftBranches.length; }
  get filteredApprovedCount(): number { return this.storeFilteredApprovedBranches.length; }
  get filteredSubmittedCount(): number { return this.storeFilteredSubmittedBranches.length; }
}
