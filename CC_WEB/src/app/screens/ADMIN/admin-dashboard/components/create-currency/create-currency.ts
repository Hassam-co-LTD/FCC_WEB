import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; 

import Swal from 'sweetalert2'; 
import { ApiService } from '../../../../../core/services/api.service';

@Component({
  selector: 'app-currency-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,   
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
  ],
  templateUrl: './create-currency.html',
  styleUrls: ['./create-currency.scss']
})
export class CreateCurrency implements OnInit {

  currencyForm!: FormGroup;
  storeCurrency: any = {};

  isEditMode = false;
  isOpen = true;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCurrency();
  }

  private buildForm(): void {
    this.currencyForm = this.fb.group({
      currencyCode: ['', Validators.required],
      currencyDesc: ['', Validators.required],
      currencyMapId: [''],
      currencyStatus: ['A'],  // default Active
      recordStatus: ['N'],
      inputterId: [''],
      authorizerId: [''],
      rejectReason: ['']
    });
  }

  private loadCurrency(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Loading currency with ID:', id);
    if (id) {
      this.isEditMode = true;

      this.api.getTnxById(Number(id), "currency").subscribe({
        next: res => {
          this.storeCurrency = res;
          console.log('get Currency By:', res);
          this.currencyForm.patchValue(res);
        },
        error: err => console.error('Load failed', err)
      });
    }
  }

  // ---------------- CREATE ----------------
  onSave(): void {
    if (this.currencyForm.invalid) return;

    const payload = this.currencyForm.getRawValue();
    console.log('Payload to save:', payload);
    
    this.api.saveTnx(payload, 'currency').subscribe({
      next: res => {
        console.log("Saved response:", res);
        Swal.fire('Saved!', 'Currency saved successfully', 'success')
          .then(() => this.router.navigate(['/admin/currency-list']));
      },
      error: err => console.error('Save failed', err)
    });
  }

  // ---------------- UPDATE ----------------
  update(id: number): void {
    if (this.currencyForm.invalid) return;

    const payload = this.currencyForm.getRawValue();

    this.api.updateTnx(payload, 'currency', id).subscribe({
      next: () => {
        Swal.fire('Updated!', 'Currency updated successfully', 'success')
          .then(() => this.router.navigate(['/admin/currency-list']));
      },
      error: err => console.error('Update failed', err)
    });
  }

  activate(id: number): void {
    this.api.setTnxByStatus('A', id, 'currency').subscribe({
      next: () => {
        Swal.fire('Activated!', 'Currency is now Active', 'success')
          .then(() => this.loadCurrency());
      },
      error: err => console.error('Activate failed', err)
    });
  }

  deactivate(id: number): void {
    this.api.setTnxByStatus('I', id, 'currency').subscribe({
      next: () => {
        Swal.fire('Deactivated!', 'Currency is now Inactive', 'success')
          .then(() => this.loadCurrency());
      },
      error: err => console.error('Deactivate failed', err)
    });
  }

  // ---------------- UI HELPERS ----------------
  isReadOnly(): boolean {
    if (!this.storeCurrency) return true;
    return false;
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  onBack(): void {
    this.location.back();
  }

  onCancel(): void {
    this.currencyForm.reset();
  }

  submit(): void {    
    if (!this.storeCurrency?.currencyCode) return;
    this.api.setTnxByStatus('S', this.storeCurrency.currencyCode, 'currency').subscribe({
      next: res => {
        console.log('Submitted response:', res);
        Swal.fire('Submitted!', 'Currency submitted successfully', 'success')
          .then(() => this.router.navigate(['/admin/currency-list']));
      },  
      error: err => console.error('Submit failed', err)
    });
  }

  reject(id: number): void { 
    if (!this.storeCurrency?.currencyCode) return;
    this.api.setTnxByStatus('D', this.storeCurrency.currencyCode, 'currency').subscribe({
      next: () => {
        Swal.fire('Rejected!', 'Currency rejected successfully', 'success')
          .then(() => this.router.navigate(['/admin/currency-list']));
      },
      error: err => console.error('Reject failed', err)
    });
  } 

  approve(id: number): void {  
    if (!this.storeCurrency?.currencyCode) return;    
    this.api.setTnxByStatus('A', this.storeCurrency.currencyCode, 'currency').subscribe({   
      next: () => {
        Swal.fire('Approved!', 'Currency approved successfully', 'success')
          .then(() => this.router.navigate(['/admin/currency-list']));
      },
      error: err => console.error('Approve failed', err)
    });
  } 
}
