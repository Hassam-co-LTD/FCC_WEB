import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subscription, interval } from 'rxjs';

// Import the Account Search Dialog Component
import { AccountSearchDialogComponent } from '../../../../../../../../../shared/account-search-dialog/account-search-dialog';

@Component({
  selector: 'app-general-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './general-details.html',
  styleUrls: ['./general-details.scss']
})
export class GeneralDetails implements OnInit, OnDestroy, OnChanges {
  @Input() form!: FormGroup;
  @Input() transactionId: string = ''; // Add this input for dynamic transaction ID
  @Output() sectionToggled = new EventEmitter<boolean>();
  
  isGeneralDetailsOpen = true;
  currentDate: string = '';
  private dateSubscription!: Subscription;
  displayTransactionId: string = '';

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    // Initialize and start updating the date
    this.updateCurrentDate();
    
    // Update date every minute to catch day changes
    this.dateSubscription = interval(60000).subscribe(() => {
      this.updateCurrentDate();
    });
    
    // Also update form control with current date
    this.updateFormDate();
    
    // Set initial transaction ID display
    this.updateTransactionIdDisplay();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['transactionId']) {
      this.updateTransactionIdDisplay();
    }
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.dateSubscription) {
      this.dateSubscription.unsubscribe();
    }
  }

  private updateCurrentDate() {
    const now = new Date();
    this.currentDate = this.formatDate(now);
    
    // Update form control if it exists
    this.updateFormDate();
  }

  private updateFormDate() {
    if (this.form.get('transferDate')) {
      this.form.get('transferDate')?.setValue(new Date());
    }
  }

  private updateTransactionIdDisplay() {
    // If transactionId is provided, use it
    if (this.transactionId) {
      this.displayTransactionId = this.transactionId;
    } else {
      // Generate a placeholder that shows the pattern
      const now = new Date();
      const year = now.getFullYear().toString().substring(2); // Last 2 digits of year
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      this.displayTransactionId = `IT${year}${month}${day}`; // Placeholder pattern
    }
  }

  private formatDate(date: Date): string {
    // Format: Month Day, Year (e.g., January 20, 2026)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  }

  toggleGeneralDetails() {
    this.isGeneralDetailsOpen = !this.isGeneralDetailsOpen;
    this.sectionToggled.emit(this.isGeneralDetailsOpen);
  }

  // Method to open account search dialog
openAccountSearchDialog(accountType: 'transferFrom' | 'transferTo') {
  const userRole = sessionStorage.getItem('userRole') || '';
  
  const dialogRef = this.dialog.open(AccountSearchDialogComponent, {
    width: '800px',
    height: '600px',
    panelClass: 'account-search-dialog',
    data: {
      accountType: accountType,
      currentSelectedAccount: this.form.get(accountType)?.value,
      userRole: userRole
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Update the form with selected account
      this.form.get(accountType)?.setValue(result.accountNumber);
      
      // You might want to store additional account info
      this.form.get(`${accountType}_accountName`)?.setValue(result.accountName);
      this.form.get(`${accountType}_balance`)?.setValue(result.balance);
      this.form.get(`${accountType}_currency`)?.setValue(result.currency);
      
      // If transferring from account, validate balance
      if (accountType === 'transferFrom') {
        const amount = this.form.get('amount')?.value;
        if (amount && amount > result.balance) {
          this.form.get('amount')?.setErrors({ insufficientBalance: true });
        }
      }
    }
  });
}
}