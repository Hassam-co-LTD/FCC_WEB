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
  templateUrl: './role-master-list.html',
  styleUrls: ['./role-master-list.scss']
})
export class RoleMasterList implements OnInit {

  // ================== Tabs ==================
  selectedTabIndex: number = 0;

  // ================== Data ==================
  draftRoles: any[] = [];
  approvedRoles: any[] = [];
  submittedRoles: any[] = [];

  storeFilteredDraftRoles: any[] = [];
  storeFilteredApprovedRoles: any[] = [];
  storeFilteredSubmittedRoles: any[] = [];

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
        this.loadApprovedRoles();
      } else if (tab === 'submitted') {
        this.selectedTabIndex = 2;
        this.loadSubmittedRoles();
      } else {
        this.selectedTabIndex = 0;
        this.loadDraftRoles();
      }
    });
  }

  // ================== Tab Change ==================
  onTabChange(index: number) {
    this.selectedTabIndex = index;
    this.searchText = '';

    if (index === 0 && !this.draftRoles.length) this.loadDraftRoles();
    else if (index === 1 && !this.approvedRoles.length) this.loadApprovedRoles();
    else if (index === 2 && !this.submittedRoles.length) this.loadSubmittedRoles();
  }

  // ================== Load Roles ==================
  loadDraftRoles() {
    
    this.api.getTnxByStatus('I', 'roles').subscribe({
      next: res => {
        this.draftRoles = res;
        this.storeFilteredDraftRoles = [...res];
        console.log('Draft Roles', res);
      },
      error: err => console.error('Error fetching draft roles', err)
    });
  }

  loadApprovedRoles() {
    this.api.getTnxByStatus('A', 'roles').subscribe({
      next: res => {
        this.approvedRoles = res;
        this.storeFilteredApprovedRoles = [...res];
        console.log('Approved Roles', res);
      },
      error: err => console.error('Error fetching approved roles', err)
    });
  }

  loadSubmittedRoles() {
    this.api.getTnxByStatus('S', 'roles').subscribe({
      next: res => {
        this.submittedRoles = res;
        this.storeFilteredSubmittedRoles = [...res];
        console.log('Submitted Roles', res);
      },
      error: err => console.error('Error fetching submitted roles', err)
    });
  }

  // ================== Filters ==================
  filterDraftRoles(search: string): void {
    if (!search) {
      this.storeFilteredDraftRoles = [...this.draftRoles];
      return;
    }

    const value = search.toLowerCase();
    this.storeFilteredDraftRoles = this.draftRoles.filter(r =>
      r.roleId?.toLowerCase().includes(value) ||
      r.roleDesc?.toLowerCase().includes(value) ||
      r.roleDest?.toLowerCase().includes(value)
    );
  }

  filterApprovedRoles(search: string): void {
    if (!search) {
      this.storeFilteredApprovedRoles = [...this.approvedRoles];
      return;
    }

    const value = search.toLowerCase();
    this.storeFilteredApprovedRoles = this.approvedRoles.filter(r =>
      r.roleId?.toLowerCase().includes(value) ||
      r.roleDesc?.toLowerCase().includes(value) ||
      r.roleDest?.toLowerCase().includes(value)
    );
  }

  filterSubmittedRoles(search: string): void {
    if (!search) {
      this.storeFilteredSubmittedRoles = [...this.submittedRoles];
      return;
    }

    const value = search.toLowerCase();
    this.storeFilteredSubmittedRoles = this.submittedRoles.filter(r =>
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
  trackByRoleId(index: number, item: any) {
    return item.roleId;
  }

  // ================== Counts ==================
  get draftCount(): number { return this.draftRoles.length; }
  get approvedCount(): number { return this.approvedRoles.length; }
  get submittedCount(): number { return this.submittedRoles.length; }

  get filteredDraftCount(): number { return this.storeFilteredDraftRoles.length; }
  get filteredApprovedCount(): number { return this.storeFilteredApprovedRoles.length; }
  get filteredSubmittedCount(): number { return this.storeFilteredSubmittedRoles.length; }
}
