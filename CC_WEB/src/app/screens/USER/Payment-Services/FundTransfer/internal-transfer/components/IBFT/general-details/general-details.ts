import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Subscription, interval } from 'rxjs';
import { AccountSearchDialogComponent } from '../../../../../../../../shared/account-search-dialog/account-search-dialog';

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
    MatDialogModule,
    MatCheckboxModule,
    FormsModule,
  ],
  templateUrl: './general-details.html',
  styleUrls: ['./general-details.scss']
})
export class GeneralDetails implements OnInit, OnDestroy, OnChanges {
  @Input() form!: FormGroup;
  @Input() transactionId: string = '';
  @Output() sectionToggled = new EventEmitter<boolean>();
  
  isGeneralDetailsOpen = true;
  isBeneficiaryDetailsVisible = false;
  currentDate: string = '';
  private dateSubscription!: Subscription;

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    this.updateCurrentDate();
    this.dateSubscription = interval(60000).subscribe(() => this.updateCurrentDate());
    this.updateFormDate();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['transactionId']) { /* Logic for ID updates */ }
  }

  ngOnDestroy() {
    if (this.dateSubscription) this.dateSubscription.unsubscribe();
  }

  toggleBeneficiaryDetails() {
  this.isBeneficiaryDetailsVisible = !this.isBeneficiaryDetailsVisible;
}

  toggleGeneralDetails() {
    this.isGeneralDetailsOpen = !this.isGeneralDetailsOpen;
    this.sectionToggled.emit(this.isGeneralDetailsOpen);
  }

  private updateCurrentDate() {
    const now = new Date();
    this.currentDate = now.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
    });
    this.updateFormDate();
  }

  private updateFormDate() {
    if (this.form.get('transferDate')) {
      this.form.get('transferDate')?.setValue(new Date());
    }
  }

  openAccountSearchDialog(accountType: 'transferFrom' | 'transferTo') {
    const dialogRef = this.dialog.open(AccountSearchDialogComponent, {
      width: '800px',
      height: '600px',
      data: { 
        accountType, 
        currentSelectedAccount: this.form.get(accountType)?.value 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.form.get(accountType)?.setValue(result.accountNumber);
        this.form.get(`${accountType}_accountName`)?.setValue(result.accountName);
        // Reset visibility if account changes to force a re-check
        if(accountType === 'transferTo') this.isBeneficiaryDetailsVisible = false;
      }
    });
  }
}