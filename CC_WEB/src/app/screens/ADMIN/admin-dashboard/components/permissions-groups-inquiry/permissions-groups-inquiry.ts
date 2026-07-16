import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../../../core/services/api.service';

/** * Strongly-typed interface representing the Permission Group records * displayed inside the table rows and targeted by the filters. */
export interface PermissionGroupRow {
  id: string | number;
  permissionGroupId: string;
  permissionGroupName: string;
  permissionGroupStatus: string;
  recordStatus: string;
  description?: string;
  moduleName?: string;
  createdBy?: string;
  createdOn?: string | Date;
  updatedBy?: string;
  updatedOn?: string | Date;
  inputterId?: string;
  inputterDttm?: string | Date;
  authorizerId?: string;
  authorizerDttm?: string | Date;
}

@Component({
  selector: 'app-role-master-list',
  standalone: true,
  imports: [
    MatTabsModule,
    CommonModule,
    FormsModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './permissions-groups-inquiry.html',
  styleUrls: ['./permissions-groups-inquiry.scss'],
})
export class PermissionsGroupsInquiry implements OnInit, OnDestroy {
  // =========================
  // CLASS PROPERTIES
  // =========================
  public selectedTabIndex = 0;
  public searchText = '';

  // Data Lists
  public draftPermissionsGroup: PermissionGroupRow[] = [];
  public approvedPermissionsGroup: PermissionGroupRow[] = [];
  public submittedPermissionsGroup: PermissionGroupRow[] = [];

  public storeFilteredDraftPermissionsGroup: PermissionGroupRow[] = [];
  public storeFilteredApprovedPermissionsGroup: PermissionGroupRow[] = [];
  public storeFilteredSubmittedPermissionsGroup: PermissionGroupRow[] = [];

  // Constants
  private readonly TXN_PERMISSIONS_GROUP = 'PermissionsGroup';
  private readonly STATUS_DRAFT = 'I';
  private readonly STATUS_APPROVED = 'A';
  private readonly STATUS_SUBMITTED = 'S';

  // Subscriptions
  private routeSubscription!: Subscription;

  // =========================
  // CONSTRUCTOR
  // =========================
  constructor(
    private readonly api: ApiService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  // =========================
  // LIFECYCLE HOOKS
  // =========================
  public ngOnInit(): void {
    this.routeSubscription = this.route.queryParams.subscribe((params) => {
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

  public ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  // =========================
  // PRIVATE HELPER METHODS
  // =========================
  /** * Filters records across the keys specified in the search placeholder * (Permission ID, Permission Name, and Module Name). */
  private filterList(originalList: PermissionGroupRow[], search: string): PermissionGroupRow[] {
    if (!search) {
      return [...originalList];
    }
    const value = search.toLowerCase();
    return originalList.filter((item) => {
      return (
        item.permissionGroupId?.toLowerCase().includes(value) ||
        item.permissionGroupName?.toLowerCase().includes(value) ||
        item.moduleName?.toLowerCase().includes(value) ||
        item.description?.toLowerCase().includes(value)
      );
    });
  }

  // =========================
  // DATA LOADING
  // =========================
  public loadDraftPermissionsGroup(): void {
    this.api.getTnxByStatus(this.STATUS_DRAFT, this.TXN_PERMISSIONS_GROUP).subscribe({
      next: (res: any) => {
        const data = (res as PermissionGroupRow[]) || [];
        this.draftPermissionsGroup = data;
        this.storeFilteredDraftPermissionsGroup = [...data];
      },
      error: (err: unknown) => {
        console.error('Error fetching draft PermissionsGroup', err);
      },
    });
  }

  public loadApprovedPermissionsGroup(): void {
    this.api.getTnxByStatus(this.STATUS_APPROVED, this.TXN_PERMISSIONS_GROUP).subscribe({
      next: (res: any) => {
        const data = (res as PermissionGroupRow[]) || [];
        this.approvedPermissionsGroup = data;
        this.storeFilteredApprovedPermissionsGroup = [...data];
      },
      error: (err: unknown) => {
        console.error('Error fetching approved PermissionsGroup', err);
      },
    });
  }

  public loadSubmittedPermissionsGroup(): void {
    this.api.getTnxByStatus(this.STATUS_SUBMITTED, this.TXN_PERMISSIONS_GROUP).subscribe({
      next: (res: any) => {
        const data = (res as PermissionGroupRow[]) || [];
        this.submittedPermissionsGroup = data;
        this.storeFilteredSubmittedPermissionsGroup = [...data];
      },
      error: (err: unknown) => {
        console.error('Error fetching submitted PermissionsGroup', err);
      },
    });
  }

  // =========================
  // TABS & INTERACTION METHODS
  // =========================
  public onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.searchText = '';

    if (index === 0 && !this.draftPermissionsGroup.length) {
      this.loadDraftPermissionsGroup();
    } else if (index === 1 && !this.approvedPermissionsGroup.length) {
      this.loadApprovedPermissionsGroup();
    } else if (index === 2 && !this.submittedPermissionsGroup.length) {
      this.loadSubmittedPermissionsGroup();
    }
  }

  // =========================
  // FILTER METHODS (HTML Bound)
  // =========================
  public filterDraftPermissionsGroup(search: string): void {
    this.storeFilteredDraftPermissionsGroup = this.filterList(this.draftPermissionsGroup, search);
  }

  public filterApprovedPermissionsGroup(search: string): void {
    this.storeFilteredApprovedPermissionsGroup = this.filterList(this.approvedPermissionsGroup, search);
  }

  public filterSubmittedPermissionsGroup(search: string): void {
    this.storeFilteredSubmittedPermissionsGroup = this.filterList(this.submittedPermissionsGroup, search);
  }

  // =========================
  // NAVIGATION METHODS
  // =========================
  public updateRouter(role: PermissionGroupRow): Promise<boolean> {
    return this.router.navigate(['/admin/create-role', role.permissionGroupId]);
  }

  // =========================
  // UTILITY & TRACK BY
  // =========================
  public trackByPermissionId(index: number, item: PermissionGroupRow): string | number {
    return item.id;
  }

  // =========================
  // GETTERS & COUNTS
  // =========================
  public get draftCount(): number {
    return this.draftPermissionsGroup.length;
  }

  public get approvedCount(): number {
    return this.approvedPermissionsGroup.length;
  }

  public get submittedCount(): number {
    return this.submittedPermissionsGroup.length;
  }

  public get filteredDraftCount(): number {
    return this.storeFilteredDraftPermissionsGroup.length;
  }

  public get filteredApprovedCount(): number {
    return this.storeFilteredApprovedPermissionsGroup.length;
  }

  public get filteredSubmittedCount(): number {
    return this.storeFilteredSubmittedPermissionsGroup.length;
  }
}