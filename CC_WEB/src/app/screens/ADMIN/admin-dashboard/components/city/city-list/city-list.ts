import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { NgModel } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../../../../core/services/api.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-city-records',
  templateUrl: './city-list.html',
  styleUrls: ['./city-list.scss'],
  standalone: true,
  imports: [MatTabsModule, CommonModule, MatIconModule, FormsModule, ReactiveFormsModule]
})
export class CityList implements OnInit {

  // ================== Form ==================
  cityForm: FormGroup;

  // ================== Tabs ==================
  selectedTabIndex: number = 0;

  // ================== Search ==================
  searchText: string = '';

  // ================== Records ==================
  draftCities: any[] = [];
  approvedCities: any[] = [];
  submittedCities: any[] = [];

  storeFilteredDraftCities: any[] = [];
  storeFilteredApprovedCities: any[] = [];
  storeFilteredSubmittedCities: any[] = [];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private route: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.cityForm = this.fb.group({
      id: [null, Validators.required],        // Manual ID
      cityName: ['', Validators.required],
      state: [''],
      country: ['']
    });
  }

  ngOnInit(): void {
    // Check query params for tabName
    this.activatedRoute.queryParams.subscribe(params => {
      const tab = params['tabName'];
      if (tab === 'Approved') this.selectedTabIndex = 1;
      else if (tab === 'Submitted') this.selectedTabIndex = 2;
      else this.selectedTabIndex = 0;

      // Load cities for all tabs
      this.loadDraftCities();
      this.loadApprovedCities();
      this.loadSubmittedCities();
    });
  }

  // ================== Tab Change ==================
  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.searchText = '';
  }

  // ================== Load Cities ==================
  loadDraftCities(): void {
    this.api.getCityByStatus('D').subscribe({
      next: res => {
        this.draftCities = res;
        this.storeFilteredDraftCities = [...res];
      },
      error: err => console.error('Error fetching draft cities', err)
    });
  }

  loadApprovedCities(): void {
    this.api.getCityByStatus('A').subscribe({
      next: res => {
        this.approvedCities = res;
        this.storeFilteredApprovedCities = [...res];
      },
      error: err => console.error('Error fetching approved cities', err)
    });
  }

  loadSubmittedCities(): void {
    this.api.getCityByStatus('S').subscribe({
      next: res => {
        this.submittedCities = res;
        this.storeFilteredSubmittedCities = [...res];
      },
      error: err => console.error('Error fetching submitted cities', err)
    });
  }

  // ================== Filter Cities ==================
  filterDraftCities(search: string): void {
    if (!search) {
      this.storeFilteredDraftCities = [...this.draftCities];
      return;
    }
    const value = search.toLowerCase();
    this.storeFilteredDraftCities = this.draftCities.filter(
      c => c.id?.toString().toLowerCase().includes(value) || c.cityName?.toLowerCase().includes(value)
    );
  }

  filterApprovedCities(search: string): void {
    if (!search) {
      this.storeFilteredApprovedCities = [...this.approvedCities];
      return;
    }
    const value = search.toLowerCase();
    this.storeFilteredApprovedCities = this.approvedCities.filter(
      c => c.id?.toString().toLowerCase().includes(value) || c.cityName?.toLowerCase().includes(value)
    );
  }

  filterSubmittedCities(search: string): void {
    if (!search) {
      this.storeFilteredSubmittedCities = [...this.submittedCities];
      return;
    }
    const value = search.toLowerCase();
    this.storeFilteredSubmittedCities = this.submittedCities.filter(
      c => c.id?.toString().toLowerCase().includes(value) || c.cityName?.toLowerCase().includes(value)
    );
  }

  // ================== Router ==================
  updateRouter(cityId: any): void {
    this.route.navigate(['/admin/city', cityId], {
      queryParams: { tabName: this.selectedTabIndex === 0 ? 'Draft' : this.selectedTabIndex === 1 ? 'Approved' : 'Submitted' }
    });
  }

  // ================== Track By ==================
  trackById(index: number, item: any): any {
    return item.id;
  }

  // ================== Counts ==================
  get draftCount(): number { return this.draftCities.length; }
  get approvedCount(): number { return this.approvedCities.length; }
  get submittedCount(): number { return this.submittedCities.length; }

  get filteredDraftCount(): number { return this.storeFilteredDraftCities.length; }
  get filteredApprovedCount(): number { return this.storeFilteredApprovedCities.length; }
  get filteredSubmittedCount(): number { return this.storeFilteredSubmittedCities.length; }
}
