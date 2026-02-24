import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
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
    MatIconModule,
    MatDialogModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    FormsModule,
  ],
  templateUrl: './general-details.html',
  styleUrls: ['./general-details.scss']
})
export class GeneralDetails implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  @Input() savedBeneficiaries: any[] = []; // Input from parent
  @Output() sectionToggled = new EventEmitter<boolean>();
  @Output() nicknameSaved = new EventEmitter<{nickname: string, accountNumber: string, accountName: string}>();
  
  isGeneralDetailsOpen = true;
  isBeneficiaryDetailsVisible = false;
  currentDate: string = '';
  private dateSubscription!: Subscription;

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    this.updateCurrentDate();
    this.dateSubscription = interval(60000).subscribe(() => this.updateCurrentDate());
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
    if (this.form.get('transferDate')) {
      this.form.get('transferDate')?.setValue(now);
    }
  }
saveNewNickname() {
  const controls = this.form.controls;
  const nickname = controls['transferTo_accountNickname'].value;
  const accNum = controls['transferTo'].value;
  const accName = controls['transferTo_accountName'].value;

  if (nickname && accNum) {
    this.nicknameSaved.emit({
      nickname: nickname.trim(),
      accountNumber: accNum.trim(),
      accountName: accName ? accName.trim() : ''
    });
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
      }
    });
  }
}