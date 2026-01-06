import { Component, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ApiService } from '../../../../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [MatTabsModule, CommonModule, FormsModule, MatIconModule],
  templateUrl: './branch-list.html',
  styleUrls: ['./branch-list.scss']
})
export class BranchList implements OnInit {

  selectedTabIndex: number = 0;

  draftBranches: any[] = [];
  approvedBranches: any[] = [];
  submittedBranches: any[] = [];

  storeFilteredDraftBranches: any[] = [];
  storeFilteredApprovedBranches: any[] = [];
  storeFilteredSubmittedBranches: any[] = [];

  searchText: string = '';

  constructor(private api: ApiService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Read tabName from URL query param
    this.route.queryParams.subscribe(params => {
      const tab = params['tabName'];

      if (tab === 'Approved') {
        this.selectedTabIndex = 1;
        this.loadApprovedBranches();
      } else if (tab === 'Submitted') {
        this.selectedTabIndex = 2;
        this.loadSubmittedBranches();
      } else {
        this.selectedTabIndex = 0;
        this.loadDraftBranches();
      }
    });
  }

  // Tab change handler
  onTabChange(index: number) {
    this.selectedTabIndex = index;
    this.searchText = '';

    if (index === 0 && !this.draftBranches.length) this.loadDraftBranches();
    else if (index === 1 && !this.approvedBranches.length) this.loadApprovedBranches();
    else if (index === 2 && !this.submittedBranches.length) this.loadSubmittedBranches();
  }

  // ================== Load Branches ==================
  loadDraftBranches() {
    this.api.getDraftList().subscribe({
      next: res => {
        this.draftBranches = res;
        this.storeFilteredDraftBranches = [...res];
        console.log('Draft Branches', res);
      },
      error: err => console.error('Error fetching draft branches', err)
    });
  }

  loadApprovedBranches() {
    this.api.getAllAproved().subscribe({
      next: res => {
        this.approvedBranches = res;
        this.storeFilteredApprovedBranches = [...res];
        console.log('Approved Branches', res);
      },
      error: err => console.error('Error fetching approved branches', err)
    });
  }

  loadSubmittedBranches() {
    this.api.getAllSubmitted().subscribe({
      next: res => {
        this.submittedBranches = res;
        this.storeFilteredSubmittedBranches = [...res];
        console.log('Submitted Branches', res);
      },
      error: err => console.error('Error fetching submitted branches', err)
    });
  }

  // ================== Filter Branches ==================
filterDraftBranches(search: string): void {
  if (!search) {
    this.storeFilteredDraftBranches = [...this.draftBranches];
    return;
  }
  const value = search.toLowerCase();
  this.storeFilteredDraftBranches = this.draftBranches.filter(
    b => b.branchId?.toLowerCase().includes(value)
  );
}

filterApprovedBranches(search: string): void {
  if (!search) {
    this.storeFilteredApprovedBranches = [...this.approvedBranches];
    return;
  }
  const value = search.toLowerCase();
  this.storeFilteredApprovedBranches = this.approvedBranches.filter(
    b => b.branchId?.toLowerCase().includes(value)
  );
}

filterSubmittedBranches(search: string): void {
  if (!search) {
    this.storeFilteredSubmittedBranches = [...this.submittedBranches];
    return;
  }
  const value = search.toLowerCase();
  this.storeFilteredSubmittedBranches = this.submittedBranches.filter(
    b => b.branchId?.toLowerCase().includes(value)
  );
}

  // ================== Navigation ==================
  updateRouter(id: any) {
    this.router.navigate(['/admin/create-branch/' + id]);
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
