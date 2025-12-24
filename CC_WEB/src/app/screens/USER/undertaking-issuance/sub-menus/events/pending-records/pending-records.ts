import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SharedService } from '../../../../../../core/services/user-service/shared-form-service/shared-service';
import {
  UndertakingIssuanceService,
  UndertakingTransaction
} from '../../../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';

@Component({
  selector: 'app-pending-records',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './pending-records.html',
  styleUrls: ['./pending-records.scss']
})
export class PendingRecordsComponent implements OnInit {

  pendingUndertakings: UndertakingTransaction[] = [];
  filteredUndertakings: UndertakingTransaction[] = [];
  pagedUndertakings: UndertakingTransaction[] = [];

  searchQuery = '';

  // Pagination
  itemsPerPage = 10;
  currentPage = 1;
  totalPages = 1;

  constructor(
    private undertakingService: UndertakingIssuanceService,
    private sharedService: SharedService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending(): void {
    this.pendingUndertakings =
      this.undertakingService.getPendingTransactions();

    this.applyFilters();
  }

  // ===============================
  // VIEW (EDITABLE PREVIEW)
  // ===============================
  viewTransaction(t: UndertakingTransaction): void {
    this.sharedService.setFormData({
      transactionId: t.id,
      mode: 'edit',
      canUpdate: true,
      source: 'pending'
    });

    this.router.navigate(['/undertaking-issuance/preview', t.id]);
  }

  // ===============================
  // REJECT
  // ===============================
  rejectTransaction(t: UndertakingTransaction): void {
    if (!confirm(`Reject undertaking ${t.channelReference}?`)) return;

    this.undertakingService.updateTransaction(t.id, {
      status: 'Rejected',
      updatedAt: new Date()
    });

    this.loadPending();
  }

  // ===============================
  // FILTERING
  // ===============================
  applyFilters(): void {
    const term = this.searchQuery.toLowerCase();

    this.filteredUndertakings = this.pendingUndertakings.filter(t =>
      t.channelReference?.toLowerCase().includes(term) ||
      t.customerReference?.toLowerCase().includes(term) ||
      t.beneficiary?.toLowerCase().includes(term)
    );

    this.applyPagination();
  }

  // ===============================
  // PAGINATION
  // ===============================
  applyPagination(): void {
    this.totalPages = Math.max(
      1,
      Math.ceil(this.filteredUndertakings.length / this.itemsPerPage)
    );

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    this.pagedUndertakings =
      this.filteredUndertakings.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyPagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyPagination();
    }
  }

  // ===============================
  // HELPERS
  // ===============================
  formatDate(date?: Date): string {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  }

  formatCurrency(amount?: number, currency = 'USD'): string {
    if (amount == null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  }

  getPendingDays(issueDate?: Date): number {
    if (!issueDate) return 0;
    const diff =
      new Date().getTime() - new Date(issueDate).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
