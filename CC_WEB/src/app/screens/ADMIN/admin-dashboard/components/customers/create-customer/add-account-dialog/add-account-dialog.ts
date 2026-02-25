import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button'; 
import { MatDialogActions } from '@angular/material/dialog';
import { MatDialogContent } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../../../../core/services/api.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-add-account-dialog',
  templateUrl: './add-account-dialog.html',
  styleUrls: ['./add-account-dialog.scss'],
  
  standalone: true,
  imports: [ /* Angular Material Modules */ MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDialogActions, MatDialogContent, ReactiveFormsModule, MatIcon, CommonModule]
})
export class AddAccountDialog {
  AccountsForm: FormGroup;
  isOpen = true;
  customerName: string;
  approvedAccountTypes:any[]=[];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private dialogRef: MatDialogRef<AddAccountDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.customerName = data.customerName;
    
    this.AccountsForm = this.fb.group({
      accountNo: ['', Validators.required],
      iban: ['', Validators.required],
      accountType: ['', Validators.required],
      accountTitle: ['', Validators.required],
      accountStatus: ['ACTIVE', Validators.required],
      companyId: ['', Validators.required],
      custId: [data.customerId, Validators.required]
    });
  }

  allCompanies: any[] = [];
  toggle() {
    this.isOpen = !this.isOpen;
  }

  ngOnInit(): void {
    this.loadCompanies();
    console.log('Dialog opened for customer:', this.customerName);
    console.log('Dialog data:', this.data);
    this.loadApprovedAccountTypes();
  }

  
  loadApprovedAccountTypes() {
    this.api.getTnxByStatus('A','AccountMaster').subscribe({
      next: res => {
        this.approvedAccountTypes = res;
      },
      error: err => console.error('Error fetching approved AccountTypes', err)
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.AccountsForm.valid) {
      console.log('Saving account with data:', this.AccountsForm.value);
      this.api.saveTnx(this.AccountsForm.value, 'accounts').subscribe({
        next: res => {
          console.log('Account saved:', res);
          this.dialogRef.close(res);
          Swal.fire('Saved!', 'Account added successfully', 'success');
        },
        error: err => {
          console.error('Error saving account:', err);
          Swal.fire('Error', 'Failed to add account. Please try again.', 'error');
        }
      });
    }
  }

  // load the ocmpanies for the dropdown
  
  private loadCompanies(): void {
    this.api.getTnxByStatus('A',"company").subscribe({
      next: companies =>{
           this.allCompanies = companies
           console.log('Fetched companies:', this.allCompanies);
      } ,
      error: err => console.error('Error fetching companies', err)
    });
  }

}
