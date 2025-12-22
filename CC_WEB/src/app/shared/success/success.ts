import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { ImportlcFormTransactionService } from
  '../../core/services/user-service/importlc-form-transaction-service/importlc-form-transaction-service';

@Component({
  selector: 'app-success',
  templateUrl: './success.html',
  styleUrls: ['./success.scss'],
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
})
export class Success implements OnInit {

  data: any = null;
  displayedColumns: string[] = [];

  pageName1 = 'Import LC Listing';
  pageName2 = 'New Import LC';

  constructor(
    private router: Router,
    private transactionService: ImportlcFormTransactionService
  ) { }

  ngOnInit(): void {
    /** 1️⃣ Try router state first */
    const navigation = this.router.getCurrentNavigation();
    const stateData = navigation?.extras?.state;

    if (stateData && Object.keys(stateData).length) {
      this.data = stateData;
    }
    /** 2️⃣ Fallback (page refresh / deep link) */
    else {
      const lastSubmitted = this.transactionService
        .getAllTransactions()
        .find(tx => tx.status === 'submitted');

      if (!lastSubmitted) {
        this.router.navigate(['/import-screen']);
        return;
      }

      this.data = lastSubmitted;
    }

    /** 3️⃣ Build table columns */
    this.displayedColumns = Object.keys(this.data).sort((a, b) =>
      a.localeCompare(b)
    );
  }

  displayValue(value: any): string {
    if (value === null || value === undefined || value === '') return '-';
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  }

  goToListing(): void {
    this.router.navigate(['/import-screen/listing']);
  }

  createNew(): void {
    this.router.navigate(['/import-screen/new']);
  }
}
