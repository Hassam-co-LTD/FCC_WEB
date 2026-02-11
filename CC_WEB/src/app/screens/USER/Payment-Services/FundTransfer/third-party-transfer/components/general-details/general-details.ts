import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subscription, interval } from 'rxjs';

// Import the dialog component and interface
import { AccountSearchDialogComponent, BaseAccount } from '../../../../../../../shared/account-search-dialog/account-search-dialog'; 

@Component({
  selector: 'app-general-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDialogModule,
    // DatePipe
  ],
  templateUrl: './general-details.html',
  styleUrls: ['./general-details.scss']
})
export class GeneralDetails implements OnInit, OnDestroy {
  @Input({ required: true }) form!: FormGroup;
  @Input() transactionId: string = ''; 
  
  isOpen = true;
  currentDate: string = '';
  displayTransactionId: string = '';
  private dateSubscription!: Subscription;

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    this.updateCurrentDate();
    // Update date every minute
    this.dateSubscription = interval(60000).subscribe(() => this.updateCurrentDate());
    this.updateTransactionIdDisplay();
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['transactionId']) {
  //     this.updateTransactionIdDisplay();
  //   }
  // }

  ngOnDestroy() {
    if (this.dateSubscription) {
      this.dateSubscription.unsubscribe();
    }
  }

  private updateCurrentDate() {
    const now = new Date();
    // Format: Monday, February 9, 2026
    this.currentDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
    
    // Sync with form appDate
    if (this.form.get('appDate')) {
      this.form.get('appDate')?.setValue(now);
    }
  }

  private updateTransactionIdDisplay() {
    if (this.transactionId) {
      this.displayTransactionId = this.transactionId;
    } else {
      const now = new Date();
      const datePart = now.toISOString().slice(2,10).replace(/-/g, '');
      this.displayTransactionId = `TP${datePart}`; // TP for Third Party
    }
    // Sync with form tnxId
    this.form.get('tnxId')?.setValue(this.displayTransactionId);
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  openAccountSearchDialog(type: 'transferFrom'): void {
    const dialogRef = this.dialog.open(AccountSearchDialogComponent, {
      width: '800px',
      height: '600px',
      data: {
        accountType: type,
        currentSelectedAccount: this.form.get(type)?.value
      }
    });

    dialogRef.afterClosed().subscribe((result: BaseAccount) => {
      if (result) {
        this.form.patchValue({
          [type]: result.accountNumber,
          currency: result.currency 
        });
        this.form.get(type)?.markAsDirty();
      }
    });
  }
}