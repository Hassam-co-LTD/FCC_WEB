import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { ImportlcFormTransactionService, ImportLcTransaction } from
  '../../core/services/user-service/importlc-form-transaction-service/importlc-form-transaction-service';
import { Preview } from "../../screens/USER/import-screen/components/preview/preview";

@Component({
  selector: 'app-success',
  templateUrl: './success.html',
  styleUrls: ['./success.scss'],
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, Preview],
})
export class Success implements OnInit {

  transaction!: ImportLcTransaction;
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
    const stateData = navigation?.extras?.state as {transaction?: ImportLcTransaction};

    if (stateData?.transaction) {
      this.transaction = stateData.transaction;
      return;
    }
    /** 2️⃣ Fallback (refresh / deep link) */
    const lastSubmitted = this.transactionService
      .getAllTransactions()
      .filter(tx => tx.status === 'submitted')
      .pop();

    if (!lastSubmitted) {
      this.router.navigate(['/import-screen']);
      return;
    }

    this.transaction = lastSubmitted;
  }

  goToListing(): void {
    this.router.navigate(['/import-screen/listing']);
  }

  createNew(): void {
    this.router.navigate(['/import-screen/new']);
  }
}