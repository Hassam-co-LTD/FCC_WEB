import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { ImportlcFormTransactionService } from
  '../../core/services/user-service/importlc-form-transaction-service/importlc-form-transaction-service';
// import { Preview } from "../../screens/USER/import-screen/components/preview/preview";
import { ImportLcTransaction } from "../../core/models/import-lc";

@Component({
  selector: 'app-success',
  templateUrl: './success.html',
  styleUrls: ['./success.scss'],
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
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
      .filter(tx => tx.status === 'S')
      .pop();

    if (!lastSubmitted) {
      this.router.navigate(['/import-screen/success']);
      return;
    }

    this.transaction = lastSubmitted;
  }

  goToListing(): void {
    this.router.navigate(['/import-screen/enquiries']);
  }

  createNew(): void {
    this.router.navigate(['/import-screen']);
  }
}