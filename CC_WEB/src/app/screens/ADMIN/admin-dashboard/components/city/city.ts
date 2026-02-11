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
import { MatNativeDateModule } from '@angular/material/core'; // or MatMomentDateModule if using Moment

import Swal from 'sweetalert2';
import { ApiService } from '../../../../../core/services/api.service';
@Component({
  selector: 'app-customer-profile',
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
  templateUrl: './city.html',
  styleUrls: ['./city.scss']
})
export class City implements OnInit {

  cityForm!: FormGroup;
  storeCity: any = {};

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
    this.loadCustomer();
  }

  private buildForm(): void {
    this.cityForm = this.fb.group({
     
      cityId: [''],
      cityName: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
    
    });
  }

  private loadCustomer(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Loading customer with ID:', id);
     if (!isNaN(id)) {
      this.isEditMode = true;

      this.api.getTnxById(id,"city").subscribe({
        next: res => {
          this.storeCity = res;
          console.log('get City By:', res);
          this.cityForm.patchValue(res);
        },
        error: err => console.error('Load failed', err)
      });
    }
  }

  // ---------------- CREATE ----------------
  onSave(): void {
    if (this.cityForm.invalid) return;

    const payload = this.cityForm.getRawValue();
    console.log('Payload to save:', payload);
    
    this.api.saveTnx(payload, 'city').subscribe({
     
      next: res => {
        console.log("Saved response:", res);
        Swal.fire('Saved!', 'City saved successfully', 'success')
          .then(() => this.router.navigate(['/admin/city-list'], { queryParams: { tabName: 'Draft' } } ));
      },
      error: err => console.error('Save failed', err)
    });
  }

  // ---------------- UPDATE ----------------
  update(id:number): void {
    if (this.cityForm.invalid) return;

    const payload = this.cityForm.getRawValue();

    this.api.updateTnx(payload, 'city',id).subscribe({
      next: () => {
        Swal.fire('Updated!', 'City updated successfully', 'success')
          .then(() => this.router.navigate(['/admin/city-list'], { queryParams: { tabName: 'Draft' } }));
      },
      error: err => console.error('Update failed', err)
    });
  }

  
  activate(id: number): void {
    this.api.setTnxByStatus('Active', id, 'city').subscribe({
      next: () => {
        Swal.fire('Activated!', 'City is now Active', 'success')
          .then(() => this.loadCustomer());
      },
      error: err => console.error('Activate failed', err)
    });
  }

  deactivate(id: number): void {
    this.api.setTnxByStatus('Inactive', id, 'city').subscribe({
      next: () => {
        Swal.fire('Deactivated!', 'City is now Inactive', 'success')
          .then(() => this.loadCustomer());
      },
      error: err => console.error('Deactivate failed', err)
    });
  }

  // ---------------- UI HELPERS ----------------
 isReadOnly(): boolean {
  // New city (no storeCity) → editable
  if (!this.storeCity) {
    return false;
  }

  // Existing city:
  // - Draft (D) → editable
  // - Submitted (S), Approved (A) → read-only
  return false;
}



  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  onBack(): void {
    this.location.back();
  }

  onCancel(): void {
    this.cityForm.reset();
  }
  submit() {    
    if (!this.storeCity?.id) return;
    this.api.setTnxByStatus('S', this.storeCity.id, 'city').subscribe({
      next: (res) => {
        console.log('Submited response:', res);
        Swal.fire('Submitted!', 'City submitted successfully', 'success')
          .then(() => this.router.navigate(['/admin/city-list'],{ queryParams: { tabName: 'submitted' } }));
      },  
      error: err => console.error('Submit failed', err)
    });
  }

 


  reject(id:number): void { 
    if (!this.storeCity?.id) return;
    this.api.setTnxByStatus('I', this.storeCity.id, 'city').subscribe({
      next: () => {
        Swal.fire('Rejected!', 'City rejected successfully', 'success')
          .then(() => this.router.navigate(['/admin/city-list'],{ queryParams: { tabName: 'Rejected' } }));
      },
      error: err => console.error('Reject failed', err)
    });
  } 

  approve(id: number): void {
  if (!this.storeCity?.id) return;

  this.api.setTnxByStatus('A', this.storeCity.id, 'city').subscribe({
    next: () => {
      Swal.fire('Approved!', 'City approved successfully', 'success')
        .then(() => 
          this.router.navigate(['/admin/city-list'], { queryParams: { tabName: 'approved' } })
        );
    },
    error: err => console.error('Approve failed', err)
  });
}


}
