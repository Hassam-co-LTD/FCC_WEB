import { Component, OnInit } from '@angular/core';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

interface City {
  cityCode: string;
  cityName: string;
  countryName: string;
  branchCount: number;
  status: 'active' | 'inactive';
}

interface Tab {
  key: string;
  label: string;
}

interface Country {
  code: string;
  name: string;
}

interface Status {
  key: 'active' | 'inactive';
  label: string;
}

@Component({
  selector: 'app-city-records',
  templateUrl: './city-list.html',
  styleUrls: ['./city-list.scss'],
  imports:[MatIconModule,ReactiveFormsModule,CityList,FormsModule]
})
export class CityList implements OnInit {

  // ================= DATA =================
  cities: City[] = [];
  filteredCities: City[] = [];
  pagedCities: City[] = [];
 
  countries: Country[] = [
    { code: 'US', name: 'United States' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'IN', name: 'India' },
    { code: 'AE', name: 'UAE' }
  ];

  statuses: Status[] = [
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' }
  ];

  tabs: Tab[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' }
  ];

  // ================= UI STATE =================
  searchQuery: string = '';
  countryFilter: string = '';
  statusFilter: 'active' | 'inactive' | '' = '';
  activeTab: string = 'all';
  showAdvanced: boolean = false;

  // ================= PAGINATION =================
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  constructor() { }

  ngOnInit(): void {
    // Sample data (frontend-only)
    this.cities = Array.from({ length: 50 }, (_, i) => ({
      cityCode: 'C' + (i + 100),
      cityName: 'City ' + (i + 1),
      countryName: this.countries[i % this.countries.length].name,
      branchCount: Math.floor(Math.random() * 15) + 1,
      status: i % 2 === 0 ? 'active' : 'inactive'
    }));

    this.applyFilters();
  }

  // ================= FILTERING =================
  applyFilters(): void {
    let filtered = [...this.cities];

    // Search by city name, code, or country
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(city =>
        city.cityName.toLowerCase().includes(query) ||
        city.cityCode.toLowerCase().includes(query) ||
        city.countryName.toLowerCase().includes(query)
      );
    }

    // Country filter
    if (this.countryFilter) {
      filtered = filtered.filter(city => city.countryName === this.getCountryName(this.countryFilter));
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(city => city.status === this.statusFilter);
    }

    // Tab filter
    if (this.activeTab !== 'all') {
      filtered = filtered.filter(city => city.status === this.activeTab);
    }

    this.filteredCities = filtered;
    this.totalPages = Math.ceil(this.filteredCities.length / this.pageSize);
    this.currentPage = 1;
    this.updatePagedCities();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  setActiveTab(tabKey: string): void {
    this.activeTab = tabKey;
    this.applyFilters();
  }

  getTabCount(tabKey: string): number {
    if (tabKey === 'all') return this.cities.length;
    return this.cities.filter(city => city.status === tabKey).length;
  }

  getCountryName(code: string): string {
    const country = this.countries.find(c => c.code === code);
    return country ? country.name : '';
  }

  // ================= SORTING =================
  sortBy(key: keyof City): void {
    this.filteredCities.sort((a, b) => {
      if (a[key] < b[key]) return -1;
      if (a[key] > b[key]) return 1;
      return 0;
    });
    this.updatePagedCities();
  }

  // ================= PAGINATION =================
  updatePagedCities(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedCities = this.filteredCities.slice(start, start + this.pageSize);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedCities();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedCities();
    }
  }

  // ================= ACTION =================
  viewCity(city: City): void {
    // Placeholder for view action
    alert(`Viewing city: ${city.cityName} (${city.cityCode})`);
  }

  // ================= TRACK BY =================
  trackByCityCode(index: number, city: City): string {
    return city.cityCode;
  }

}
