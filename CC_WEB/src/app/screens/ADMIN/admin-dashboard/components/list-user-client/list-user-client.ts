import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../../core/services/api.service';
import Swal from 'sweetalert2';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-clientUsers-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTabsModule, MatIconModule, RouterLink],
  templateUrl: './list-user-client.html',
  styleUrls: ['./list-user-client.scss']
})
export class clientUsersList implements OnInit {

  selectedTabIndex = 0;

  draftclientUsers: any[] = [];
  approvedclientUsers: any[] = [];
  submittedclientUsers: any[] = [];

  storeFilteredDraftclientUsers: any[] = [];
  storeFilteredApprovedclientUsers: any[] = [];
  storeFilteredSubmittedclientUsers: any[] = [];

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
    if (index === 0) this.loadDraftclientUsers();
    else if (index === 1) this.loadApprovedclientUsers();
    else if (index === 2) this.loadSubmittedclientUsers();

    this.searchText = '';
  }

  // ================== Load clientUsers ==================
  loadDraftclientUsers() {
    this.api.getTnxByStatus('I','clientUsers').subscribe({
      next: res => {
        console.log('Draft clientUsers response:', res);
        
        this.draftclientUsers = res;
        this.storeFilteredDraftclientUsers = [...res];  
      },
      error: err => console.error('Error fetching draft clientUsers', err)
    });
  }

  loadApprovedclientUsers() {
    this.api.getTnxByStatus('A','clientUsers').subscribe({
      next: res => {
        this.approvedclientUsers = res;
        this.storeFilteredApprovedclientUsers = [...res];
      },
      error: err => console.error('Error fetching approved clientUsers', err)
    });
  }

  loadSubmittedclientUsers() {
    this.api.getTnxByStatus('S','clientUsers').subscribe({
      next: res => {
        this.submittedclientUsers = res;
        this.storeFilteredSubmittedclientUsers = [...res];
      },
      error: err => console.error('Error fetching submitted clientUsers', err)
    });
  }

  // ================== Filter clientUsers ==================
  filterDraftclientUsers(search: string) {
    if (!search) { this.storeFilteredDraftclientUsers = [...this.draftclientUsers]; return; }
    const value = search.toLowerCase();
    this.storeFilteredDraftclientUsers = this.draftclientUsers.filter(c =>
      c.cId?.toLowerCase().includes(value) ||
      c.name?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  filterApprovedclientUsers(search: string) {
    if (!search) { this.storeFilteredApprovedclientUsers = [...this.approvedclientUsers]; return; }
    const value = search.toLowerCase();
    this.storeFilteredApprovedclientUsers = this.approvedclientUsers.filter(c =>
      c.cId?.toLowerCase().includes(value) ||
      c.name?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  filterSubmittedclientUsers(search: string) {
    if (!search) { this.storeFilteredSubmittedclientUsers = [...this.submittedclientUsers]; return; }
    const value = search.toLowerCase();
    this.storeFilteredSubmittedclientUsers = this.submittedclientUsers.filter(c =>
      c.cId?.toLowerCase().includes(value) ||
      c.name?.toLowerCase().includes(value) ||
      c.email?.toLowerCase().includes(value)
    );
  }

  // ================== Actions ==================
  updateRouter(clientUsers: any) {
    this.router.navigate(['/admin/create-client-user/' + clientUsers.id]);
  }

  submitStatus(id: number) {
    this.api.setTnxByStatus('S', id, 'clientUsers').subscribe({
      next: () => {
        Swal.fire('Success', 'clientUsers submitted successfully', 'success');
        this.loadDraftclientUsers();
        this.loadSubmittedclientUsers();
      },
      error: err => Swal.fire('Error', 'Failed to submit clientUsers', 'error')
    });
  }

  setApprove(id: number) {
    this.api.setTnxByStatus('A', id, 'clientUsers').subscribe({
      next: () => {
        Swal.fire('Success', 'clientUsers approved successfully', 'success');
        this.loadSubmittedclientUsers();
        this.loadApprovedclientUsers();
      },
      error: err => Swal.fire('Error', 'Failed to approve clientUsers', 'error')
    });
  }

  Reject(id: number) {
    this.api.setTnxByStatus('I', id, 'clientUsers').subscribe({
      next: () => {
        Swal.fire('Success', 'clientUsers rejected successfully', 'success');
        this.loadSubmittedclientUsers();
      },
      error: err => Swal.fire('Error', 'Failed to reject clientUsers', 'error')
    });
  }

  /** ================== Edit Approved clientUsers ================== */
  editApprovedclientUsers(id: number) {
    // Move approved clientUsers back to Draft for editing
    this.api.setTnxByStatus('I', id, 'clientUsers').subscribe({
      next: () => {
        Swal.fire('Success', 'Approved clientUsers moved to Draft for editing', 'success');
        // Reload all tabs
        this.loadDraftclientUsers();
        this.loadApprovedclientUsers();
      },
      error: err => Swal.fire('Error', 'Failed to move approved clientUsers to draft', 'error')
    });
  }

  // ================== Track By ==================
  trackById(index: number, item: any) {
    return item.id;
  }

  // ================== Counts ==================
  get draftCount(): number { return this.draftclientUsers.length; }
  get approvedCount(): number { return this.approvedclientUsers.length; }
  get submittedCount(): number { return this.submittedclientUsers.length; }

  get filteredDraftCount(): number { return this.storeFilteredDraftclientUsers.length; }
  get filteredApprovedCount(): number { return this.storeFilteredApprovedclientUsers.length; }
  get filteredSubmittedCount(): number { return this.storeFilteredSubmittedclientUsers.length; }
}
