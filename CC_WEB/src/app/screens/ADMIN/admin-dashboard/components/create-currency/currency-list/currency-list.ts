import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { NgModel } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../../../../core/services/api.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-currency-records',
  templateUrl: './currency-list.html',
  styleUrls: ['./currency-list.scss'],
  standalone: true,
  imports: [MatTabsModule, CommonModule, MatIconModule, FormsModule, ReactiveFormsModule]
})
export class CurrencyList implements OnInit {

  // ================== Form ==================
  TnxForm: FormGroup;

  // ================== Tabs ==================
  selectedTabIndex: number = 0;

  // ================== Search ==================
  searchText: string = '';

  // ================== Records ==================
  draftTnx: any[] = [];
  approvedTnx: any[] = [];
  submittedTnx: any[] = [];

  storeFilteredDraftTnx: any[] = [];
  storeFilteredApprovedTnx: any[] = [];
  storeFilteredSubmittedTnx: any[] = [];

  apiName: string = "currency";  // API endpoint name

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private route: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.TnxForm = this.fb.group({
      currencyCode: ['', Validators.required],       // Currency Code
      currencyDesc: ['', Validators.required],
      currencyMapId: [''],
      currencyStatus: [''],
      recordStatus: ['']
    });
  }

  ngOnInit(): void {
    // Check query params for tabName
    this.activatedRoute.queryParams.subscribe(params => {
      const tab = params['tabName'];
      if (tab === 'Approved') this.selectedTabIndex = 1;
      else if (tab === 'Submitted') this.selectedTabIndex = 2;
      else this.selectedTabIndex = 0;

      // Load Tnx for all tabs
      this.loadDraftTnx();
      this.loadApprovedTnx();
      this.loadSubmittedTnx();
    });
  }

  // ================== Tab Change ==================
  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.searchText = '';
  }

  // ================== Load Tnx ==================
  loadDraftTnx(): void {
    this.api.getTnxByStatus('I', this.apiName).subscribe({
      next: res => {
        this.draftTnx = res;
        console.log('Draft Tnx response:', res);
        this.storeFilteredDraftTnx = [...res];
      },
      error: err => console.error('Error fetching draft Tnx', err)
    });
  }

  loadApprovedTnx(): void {
    this.api.getTnxByStatus('A', this.apiName).subscribe({
      next: res => {
        this.approvedTnx = res;
        this.storeFilteredApprovedTnx = [...res];
      },
      error: err => console.error('Error fetching approved Tnx', err)
    });
  }

  loadSubmittedTnx(): void {
    this.api.getTnxByStatus('S', this.apiName).subscribe({
      next: res => {
        this.submittedTnx = res;
        this.storeFilteredSubmittedTnx = [...res];
      },
      error: err => console.error('Error fetching submitted Tnx', err)
    });
  }

  // ================== Filter currency ==================
  filterDraftTnx(search: string): void {
    if (!search) {
      this.storeFilteredDraftTnx = [...this.draftTnx];
      return;
    }
    const value = search.toLowerCase();
    this.storeFilteredDraftTnx = this.draftTnx.filter(
      c => c.currencyCode?.toLowerCase().includes(value) || c.currencyDesc?.toLowerCase().includes(value)
    );
  }

  filterApprovedTnx(search: string): void {
    if (!search) {
      this.storeFilteredApprovedTnx = [...this.approvedTnx];
      return;
    }
    const value = search.toLowerCase();
    this.storeFilteredApprovedTnx = this.approvedTnx.filter(
      c => c.currencyCode?.toLowerCase().includes(value) || c.currencyDesc?.toLowerCase().includes(value)
    );
  }

  filterSubmittedTnx(search: string): void {
    if (!search) {
      this.storeFilteredSubmittedTnx = [...this.submittedTnx];
      return;
    }
    const value = search.toLowerCase();
    this.storeFilteredSubmittedTnx = this.submittedTnx.filter(
      c => c.currencyCode?.toLowerCase().includes(value) || c.currencyDesc?.toLowerCase().includes(value)
    );
  }

  // ================== Router ==================
  updateRouter(currencyCode: any): void {
    this.route.navigate(['/admin/currency', currencyCode], {
      queryParams: { 
        tabName: this.selectedTabIndex === 0 ? 'Draft' : this.selectedTabIndex === 1 ? 'Approved' : 'Submitted' 
      }
    });
  }

  // ================== Track By ==================
  trackById(index: number, item: any): any {
    return item.currencyCode;
  }

  // ================== Counts ==================
  get draftCount(): number { return this.draftTnx.length; }
  get approvedCount(): number { return this.approvedTnx.length; }
  get submittedCount(): number { return this.submittedTnx.length; }

  get filteredDraftCount(): number { return this.storeFilteredDraftTnx.length; }
  get filteredApprovedCount(): number { return this.storeFilteredApprovedTnx.length; }
  get filteredSubmittedCount(): number { return this.storeFilteredSubmittedTnx.length; }
}
