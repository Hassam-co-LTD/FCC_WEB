import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
interface CustomerRegistrationRequest {
  id: number;
  name: string | null;
  cnic: string | null;
  contactNumber: string | null;
  email: string | null;
  remarks?: string | null;
  status: string | null;
  createdOn?: string | null;
  updatedOn?: string | null;
  reviewedBy?: string | null;
  reviewRemarks?: string | null;
  reviewedOn?: string | null;
}

@Component({
  selector: 'app-middle-office',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './middle-office.html',
  styleUrl: './middle-office.scss',
})
export class MiddleOffice implements OnInit {
  requests: CustomerRegistrationRequest[] = [];
  selectedRequest: CustomerRegistrationRequest | null = null;

  searchTerm = '';
  statusFilter = 'ALL';

  isLoading = false;
  errorMessage = '';
  showDetails = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.api.getPendingCustomerRegistrationRequests().subscribe({
      next: (response) => {
        this.requests = Array.isArray(response) ? response : [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load customer registration requests:', error);

        this.errorMessage =
          error.error?.message ||
          error.error?.detail ||
          'Unable to load customer registration requests. Please try again.';

        this.isLoading = false;
      },
    });
  }

  get filteredRequests(): CustomerRegistrationRequest[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.requests.filter((request) => {
      const matchesStatus =
        this.statusFilter === 'ALL' ||
        request.status?.toUpperCase() === this.statusFilter;

      const matchesSearch =
        !search ||
        request.name?.toLowerCase().includes(search) ||
        request.cnic?.toLowerCase().includes(search) ||
        request.email?.toLowerCase().includes(search) ||
        request.contactNumber?.toLowerCase().includes(search) ||
        String(request.id).includes(search);

      return matchesStatus && matchesSearch;
    });
  }

  get pendingCount(): number {
    return this.requests.filter(
      (request) => request.status?.toUpperCase() === 'PENDING_REVIEW',
    ).length;
  }

  get displayedStatus(): string {
    return this.statusFilter === 'ALL'
      ? 'All requests'
      : this.statusFilter.replaceAll('_', ' ');
  }

  viewDetails(request: CustomerRegistrationRequest): void {
    this.selectedRequest = request;
    this.showDetails = true;
  }

  closeDetails(): void {
    this.showDetails = false;
    this.selectedRequest = null;
  }

  trackByRequestId(
    index: number,
    request: CustomerRegistrationRequest,
  ): number {
    return request.id;
  }
}
