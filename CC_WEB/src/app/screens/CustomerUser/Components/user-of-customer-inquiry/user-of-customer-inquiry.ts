import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';
import Swal from 'sweetalert2';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-clientUsers-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTabsModule, MatIconModule, RouterLink],
  templateUrl: './user-of-customer-inquiry.html',
  styleUrls: ['./user-of-customer-inquiry.scss']
})
export class UserOfCustomerInquiry implements OnInit {

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
    private route: ActivatedRoute,
    private authService: AuthService
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
    this.api.getTnxByStatus('I','clientUsers/customer-users').subscribe({
      next: res => {
        console.log('Draft clientUsers of Customers:', res);
        
        this.draftclientUsers = res;
        this.storeFilteredDraftclientUsers = [...res];  
      },
      error: err => console.error('Error fetching draft clientUsers', err)
    });
  }

  loadApprovedclientUsers() {
    this.api.getTnxByStatus('A','clientUsers/customer-users').subscribe({
      next: res => {
        this.approvedclientUsers = res;
        this.storeFilteredApprovedclientUsers = [...res];
      },
      error: err => console.error('Error fetching approved clientUsers', err)
    });
  }

  loadSubmittedclientUsers() {
    this.api.getTnxByStatus('S','clientUsers/customer-users').subscribe({
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

