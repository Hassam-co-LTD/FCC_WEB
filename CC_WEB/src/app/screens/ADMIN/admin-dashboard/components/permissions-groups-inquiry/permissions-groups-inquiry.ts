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
  templateUrl: './permissions-groups-inquiry.html',
  styleUrls: ['./permissions-groups-inquiry.scss']
})
export class  PermissionsGroupsInquiry implements OnInit {

  // ================== Tabs ==================
  selectedTabIndex: number = 0;

  // ================== Data ==================
  draftPermissionsGroup: any[] = [];
  approvedPermissionsGroup: any[] = [];
  submittedPermissionsGroup: any[] = [];

  storeFilteredDraftPermissionsGroup: any[] = [];
  storeFilteredApprovedPermissionsGroup: any[] = [];
  storeFilteredSubmittedPermissionsGroup: any[] = [];

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
        this.loadApprovedPermissionsGroup();
      } else if (tab === 'submitted') {
        this.selectedTabIndex = 2;
        this.loadSubmittedPermissionsGroup();
      } else {
        this.selectedTabIndex = 0;
        this.loadDraftPermissionsGroup();
      }
    });
  }

  // ================== Tab Change ==================
  onTabChange(index: number) {
    this.selectedTabIndex = index;
    this.searchText = '';

    if (index === 0 && !this.draftPermissionsGroup.length) this.loadDraftPermissionsGroup();
    else if (index === 1 && !this.approvedPermissionsGroup.length) this.loadApprovedPermissionsGroup();
    else if (index === 2 && !this.submittedPermissionsGroup.length) this.loadSubmittedPermissionsGroup();
  }

  // ================== Load PermissionsGroup ==================
  loadDraftPermissionsGroup() {
    
    this.api.getTnxByStatus('I', 'PermissionsGroup').subscribe({
      next: res => {
        this.draftPermissionsGroup = res;
        this.storeFilteredDraftPermissionsGroup = [...res];
        console.log('Draft PermissionsGroup', res);
      },
      error: err => console.error('Error fetching draft PermissionsGroup', err)
    });
  }

  loadApprovedPermissionsGroup() {
    this.api.getTnxByStatus('A', 'PermissionsGroup').subscribe({
      next: res => {
        this.approvedPermissionsGroup = res;
        this.storeFilteredApprovedPermissionsGroup = [...res];
        console.log('Approved PermissionsGroup', res);
      },
      error: err => console.error('Error fetching approved PermissionsGroup', err)
    });
  }

  loadSubmittedPermissionsGroup() {
    this.api.getTnxByStatus('S', 'PermissionsGroup').subscribe({
      next: res => {
        this.submittedPermissionsGroup = res;
        this.storeFilteredSubmittedPermissionsGroup = [...res];
        console.log('Submitted PermissionsGroup', res);
      },
      error: err => console.error('Error fetching submitted PermissionsGroup', err)
    });
  }

  // ================== Filters ==================
  filterDraftPermissionsGroup(search: string): void {
    if (!search) {
      this.storeFilteredDraftPermissionsGroup = [...this.draftPermissionsGroup];
      return;
    }

    const value = search.toLowerCase();
    this.storeFilteredDraftPermissionsGroup = this.draftPermissionsGroup.filter(r =>
      r.roleId?.toLowerCase().includes(value) ||
      r.roleDesc?.toLowerCase().includes(value) ||
      r.roleDest?.toLowerCase().includes(value)
    );
  }

  filterApprovedPermissionsGroup(search: string): void {
    if (!search) {
      this.storeFilteredApprovedPermissionsGroup = [...this.approvedPermissionsGroup];
      return;
    }

    const value = search.toLowerCase();
    this.storeFilteredApprovedPermissionsGroup = this.approvedPermissionsGroup.filter(r =>
      r.roleId?.toLowerCase().includes(value) ||
      r.roleDesc?.toLowerCase().includes(value) ||
      r.roleDest?.toLowerCase().includes(value)
    );
  }

  filterSubmittedPermissionsGroup(search: string): void {
    if (!search) {
      this.storeFilteredSubmittedPermissionsGroup = [...this.submittedPermissionsGroup];
      return;
    }

    const value = search.toLowerCase();
    this.storeFilteredSubmittedPermissionsGroup = this.submittedPermissionsGroup.filter(r =>
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
  get draftCount(): number { return this.draftPermissionsGroup.length; }
  get approvedCount(): number { return this.approvedPermissionsGroup.length; }
  get submittedCount(): number { return this.submittedPermissionsGroup.length; }

  get filteredDraftCount(): number { return this.storeFilteredDraftPermissionsGroup.length; }
  get filteredApprovedCount(): number { return this.storeFilteredApprovedPermissionsGroup.length; }
  get filteredSubmittedCount(): number { return this.storeFilteredSubmittedPermissionsGroup.length; }
}
