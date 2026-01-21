import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

// Import child components
import { GeneralDetails } from "./components/general-details/general-details";
import { Sidebar } from "../../../../core/sidebar/sidebar";

@Component({
  selector: 'app-my-accounts',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GeneralDetails,
    Sidebar
  ],
  templateUrl: './my-accounts.html',
  styleUrls: ['./my-accounts.scss']
})
export class MyAccountsComponent implements OnInit {
  currentStep = 0;
  myAccountsForm!: FormGroup;
  mode: 'CREATE' | 'UPDATE' | 'REJECTED' = 'CREATE';
  screenMode: 'EDIT' | 'SUBMITTED' | 'APPROVED' | 'PREVIEW' = 'EDIT';
  
  // Track section open/close states
  sections = [
    { id: 0, title: 'General Details', open: true }
  ];

  // Sidebar steps
  accountSteps = [
    { label: "My Accounts" }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.buildForm();
  }

  ngOnInit() {
    // Set default values
    const today = new Date();
    this.generalDetailsForm.get('transferDate')?.setValue(today);
  }

  private buildForm(): void {
    this.myAccountsForm = this.fb.group({
      generalDetails: this.fb.group({
        productType: ['Internal Transfer'],
        transferFrom: ['', Validators.required],
        transferTo: ['', Validators.required],
        TransactionId: ['FT260100000026'],
        transferDate: [null, Validators.required],
        amount: [null, [Validators.required, Validators.min(0.01), Validators.max(10000000000000000)]],
        transactionRemarks: ['', [Validators.maxLength(500)]]
      })
    });
  }

  // Safe getters for form groups
  get generalDetailsForm(): FormGroup { 
    return this.myAccountsForm.get('generalDetails') as FormGroup; 
  }

  scrollToSection(index: number) {
    this.currentStep = index;
    const section = document.getElementById(`section-${index}`);
    
    if (section) {
      section.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start'
      });
    }
  }

  saveForm(): void {
    // Mark all form controls as touched to trigger validation
    this.markFormGroupTouched(this.myAccountsForm);
    
    if (this.myAccountsForm.invalid) {
      this.snackBar.open('Please complete all required fields before saving.', 'Close', { 
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Get form data
    const formData = this.getFormData();
    
    // Save to localStorage for demo purposes
    this.saveToLocalStorage(formData);
    
    // Show success message
    this.snackBar.open('Draft saved successfully!', 'Close', { 
      duration: 3000,
      panelClass: ['success-snackbar']
    });
    
    // Navigate to dashboard after 1 second
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1000);
  }

  private getFormData(): any {
    const formValue = this.myAccountsForm.value;
    
    return {
      tnxId: 'FT' + Date.now(),
      timestamp: new Date().toISOString(),
      
      // All details from generalDetails form
      productType: formValue.generalDetails.productType,
      transferFrom: formValue.generalDetails.transferFrom,
      transferTo: formValue.generalDetails.transferTo,
      TransactionId: formValue.generalDetails.TransactionId,
      transferDate: formValue.generalDetails.transferDate,
      amount: formValue.generalDetails.amount,
      transactionRemarks: formValue.generalDetails.transactionRemarks,
      
      // Status
      status: 'DRAFT'
    };
  }

  private saveToLocalStorage(data: any): void {
    try {
      const existingTransactions = JSON.parse(localStorage.getItem('myAccountsTransactions') || '[]');
      existingTransactions.push(data);
      localStorage.setItem('myAccountsTransactions', JSON.stringify(existingTransactions));
      localStorage.setItem('myAccountsCurrentDraft', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  back() {
    if (this.myAccountsForm.dirty) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.router.navigate(['/dashboard']);
      }
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFormValid(): boolean {
    return this.myAccountsForm.valid;
  }

  getFormErrors(): string[] {
    const errors: string[] = [];
    
    // Check general details
    if (this.generalDetailsForm.get('transferFrom')?.hasError('required')) {
      errors.push('Transfer From account is required');
    }
    
    if (this.generalDetailsForm.get('transferTo')?.hasError('required')) {
      errors.push('Transfer To account is required');
    }
    
    if (this.generalDetailsForm.get('amount')?.hasError('required')) {
      errors.push('Amount is required');
    }
    
    if (this.generalDetailsForm.get('amount')?.hasError('min')) {
      errors.push('Amount must be greater than 0');
    }
    
    if (this.generalDetailsForm.get('amount')?.hasError('max')) {
      errors.push('Amount cannot exceed 1,000,000000');
    }
    
    if (this.generalDetailsForm.get('transferDate')?.hasError('required')) {
      errors.push('Transfer date is required');
    }
    
    // Check transaction remarks
    if (this.generalDetailsForm.get('transactionRemarks')?.hasError('maxlength')) {
      errors.push('Transaction remarks cannot exceed 500 characters');
    }
    
    return errors;
  }

  resetForm(): void {
    if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
      this.myAccountsForm.reset();
      this.buildForm();
      
      // Reset current step
      this.currentStep = 0;
      
      this.snackBar.open('Form reset successfully', 'Close', { duration: 2000 });
    }
  }

  loadSampleData(): void {
    const sampleData = {
      generalDetails: {
        productType: 'Internal Transfer',
        transferFrom: 'savings',
        transferTo: 'checking',
        TransactionId: 'FT260100000026',
        transferDate: new Date(),
        amount: 1000.50,
        transactionRemarks: 'Monthly salary payment'
      }
    };

    this.myAccountsForm.patchValue(sampleData);
    this.snackBar.open('Sample data loaded', 'Close', { duration: 2000 });
  }
}