import { Component, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ApiService } from '../../../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-role-master-list',
  standalone: true,
  imports: [
    MatTabsModule,
    CommonModule,
    FormsModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './permissions-inquiry.html',
  styleUrls: ['./permissions-inquiry.scss']
})
export class RoleMasterList implements OnInit {

  // ================== Tabs ==================
  selectedTabIndex: number = 0;

  // ================== Data ==================
  draftPermissions: any[] = [];
  approvedPermissions: any[] = [];
  submittedPermissions: any[] = [];

  storeFilteredDraftPermissions: any[] = [];
  storeFilteredApprovedPermissions: any[] = [];
  storeFilteredSubmittedPermissions: any[] = [];

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

      if (tab === 'approved') {
        this.selectedTabIndex = 1;
        this.loadApprovedPermissions();
      } else if (tab === 'submitted') {
        this.selectedTabIndex = 2;
        this.loadSubmittedPermissions();
      } else {
        this.selectedTabIndex = 0;
        this.loadDraftPermissions();
      }
    });
  }

  // ================== Tab Change ==================
  onTabChange(index: number) {
    this.selectedTabIndex = index;
    this.searchText = '';

    if (index === 0 && !this.draftPermissions.length) this.loadDraftPermissions();
    else if (index === 1 && !this.approvedPermissions.length) this.loadApprovedPermissions();
    else if (index === 2 && !this.submittedPermissions.length) this.loadSubmittedPermissions();
  }

  // ================== Load Permissions ==================
  loadDraftPermissions() {
    
    this.api.getTnxByStatus('I', 'Permissions').subscribe({
      next: res => {
        this.draftPermissions = res;
        this.storeFilteredDraftPermissions = [...res];
        console.log('Draft Permissions', res);
      },
      error: err => console.error('Error fetching draft Permissions', err)
    });
  }

  loadApprovedPermissions() {
    this.api.getTnxByStatus('A', 'Permissions').subscribe({
      next: res => {
        this.approvedPermissions = res;
        this.storeFilteredApprovedPermissions = [...res];
        console.log('Approved Permissions', res);
      },
      error: err => console.error('Error fetching approved Permissions', err)
    });
  }

  loadSubmittedPermissions() {
    this.api.getTnxByStatus('S', 'Permissions').subscribe({
      next: res => {
        this.submittedPermissions = res;
        this.storeFilteredSubmittedPermissions = [...res];
        console.log('Submitted Permissions', res);
      },
      error: err => console.error('Error fetching submitted Permissions', err)
    });
  }

  // ================== Filters ==================
  filterDraftPermissions(search: string): void {
    if (!search) {
      this.storeFilteredDraftPermissions = [...this.draftPermissions];
      return;
    }

    const value = search.toLowerCase();
    this.storeFilteredDraftPermissions = this.draftPermissions.filter(r =>
      r.roleId?.toLowerCase().includes(value) ||
      r.roleDesc?.toLowerCase().includes(value) ||
      r.roleDest?.toLowerCase().includes(value)
    );
  }

  filterApprovedPermissions(search: string): void {
    if (!search) {
      this.storeFilteredApprovedPermissions = [...this.approvedPermissions];
      return;
    }

    const value = search.toLowerCase();
    this.storeFilteredApprovedPermissions = this.approvedPermissions.filter(r =>
      r.roleId?.toLowerCase().includes(value) ||
      r.roleDesc?.toLowerCase().includes(value) ||
      r.roleDest?.toLowerCase().includes(value)
    );
  }

  filterSubmittedPermissions(search: string): void {
    if (!search) {
      this.storeFilteredSubmittedPermissions = [...this.submittedPermissions];
      return;
    }

    const value = search.toLowerCase();
    this.storeFilteredSubmittedPermissions = this.submittedPermissions.filter(r =>
      r.roleId?.toLowerCase().includes(value) ||
      r.roleDesc?.toLowerCase().includes(value) ||
      r.roleDest?.toLowerCase().includes(value)
    );
  }

  // ================== Navigation ==================
  updateRouter(role: any) {
    return this.router.navigate(['/admin/create-role', role.roleId]);
  }

  // ================== Track By ==================
  trackByPermissionId(index: number, item: any) {
    return item.roleId;
  }

  // ================== Counts ==================
  get draftCount(): number { return this.draftPermissions.length; }
  get approvedCount(): number { return this.approvedPermissions.length; }
  get submittedCount(): number { return this.submittedPermissions.length; }

  get filteredDraftCount(): number { return this.storeFilteredDraftPermissions.length; }
  get filteredApprovedCount(): number { return this.storeFilteredApprovedPermissions.length; }
  get filteredSubmittedCount(): number { return this.storeFilteredSubmittedPermissions.length; }
}
