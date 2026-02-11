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
  selector: 'app-company-profile',
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
    MatNativeDateModule
  ],
  templateUrl: './create-company.html',
  styleUrls: ['./create-company.scss']
})
export class CreateCompany implements OnInit {

  companyForm!: FormGroup;
  storeCompany: any = {};

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
    this.loadCompany();
  }

  private buildForm(): void {
    this.companyForm = this.fb.group({
                                      // optional (for edit)
      companyId: ['', Validators.required],
      companyName: ['', Validators.required],
      companyAddress: ['', Validators.required],
      companyStatus: ['A', Validators.required],  // default Active
      companyType: ['', Validators.required]
    });
  }

  private loadCompany(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.api.getTnxById(Number(id), "company").subscribe({
        next: res => {
          this.storeCompany = res;
          this.companyForm.patchValue(res);
        },
        error: err => console.error('Load failed', err)
      });
    }
  }

  // ---------------- CREATE ----------------
  onSave(): void {
    if (this.companyForm.invalid) return;

    
    const payload = this.companyForm.getRawValue();
     console.log("payload to send",payload);
    this.api.saveTnx(payload, 'company').subscribe({
      next: res => {
        console.log("response from the backend",payload);
        Swal.fire('Saved!', 'Company saved successfully', 'success')
          .then(() => this.router.navigate(['/admin/company-inquiry']));
      },
      error: (err) => {
      console.error('Save failed', err);
      console.error('Error body:', err.error);
    }
    });
  }

  // ---------------- UPDATE ----------------
  update(id: Number): void {
    if (this.companyForm.invalid) return;

    const payload = this.companyForm.getRawValue();

    this.api.updateTnx(payload, 'company', id).subscribe({
      next: () => {
        Swal.fire('Updated!', 'Company updated successfully', 'success')
          .then(() => this.router.navigate(['/admin/edit-company/',id]));
      },
      error: err => console.error('Update failed', err)
    });
  }

  activate(id: Number): void {
    this.api.setTnxByStatus('A', id, 'company').subscribe({
      next: () => this.loadCompany(),
      error: err => console.error('Activate failed', err)
    });
  }

  deactivate(id: Number): void {
    this.api.setTnxByStatus('I', id, 'company').subscribe({
      next: () => this.loadCompany(),
      error: err => console.error('Deactivate failed', err)
    });
  }

  // ---------------- UI HELPERS ----------------
  isReadOnly(): boolean {
     return false;
  
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  onBack(): void {
    this.location.back();
  }

  onCancel(): void {
    this.companyForm.reset();
  }

    submit() {    
      if (!this.storeCompany?.id) return;
      this.api.setTnxByStatus('S', this.storeCompany.id, 'company').subscribe({
        next: (res) => {
          console.log('Submited response:', res);
          Swal.fire('Submitted!', 'Company submitted successfully', 'success')
            .then(() => this.router.navigate(['/admin/company-inquiry'],{ queryParams: { tabName: 'submitted' } }));
        },  
        error: err => console.error('Submit failed', err)
      });
    }
  
   
  
  
    reject(id:number): void { 
      if (!this.storeCompany?.id) return;
      this.api.setTnxByStatus('I', this.storeCompany.id, 'company').subscribe({
        next: () => {
          Swal.fire('Rejected!', 'Company rejected successfully', 'success')
            .then(() => this.router.navigate(['/admin/company-inquiry'],{ queryParams: { tabName: 'Rejected' } }));
        },
        error: err => console.error('Reject failed', err)
      });
    } 
  
    approve(id: number): void {
    if (!this.storeCompany?.id) return;
  
    this.api.setTnxByStatus('A', this.storeCompany.id, 'company').subscribe({
      next: () => {
        Swal.fire('Approved!', 'Company approved successfully', 'success')
          .then(() => 
            this.router.navigate(['/admin/company-inquiry'], { queryParams: { tabName: 'approved' } })
          );
      },
      error: err => console.error('Approve failed', err)
    });
  }
  
}
