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
  templateUrl: './create-dropDown-option.html',
  styleUrls: ['./create-dropDown-option.scss']
})
export class CreateDynamicFieldOptions implements OnInit {

  dropdownForm!: FormGroup;
  storeDropDown: any = {};
  allDropDowns: any[] = [];

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
    this.dropdownForm = this.fb.group({     
      name: ['', Validators.required],
      description: ['', Validators.required],
      
    });
  }

  private loadCustomer(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Loading customer with ID:', id);
     if (!isNaN(id)) {
      this.isEditMode = true;

      this.api.getTnxById(id,"dynamic-dropdown").subscribe({
        next: res => {
          this.storeDropDown = res;
          console.log('get Dropdown Option By:', res);
          this.dropdownForm.patchValue(res);
        },
        error: err => console.error('Load failed', err)
      });
    }
  }

  // ---------------- CREATE ----------------
  onSave(): void {
    if (this.dropdownForm.invalid) return;

    const payload = this.dropdownForm.getRawValue();
    console.log('Payload to save:', payload);
    
    this.api.saveTnx(payload, 'dynamic-dropdown').subscribe({
     
      next: res => {
        console.log("Saved response:", res);
        Swal.fire('Saved!', 'Dropdown option saved successfully', 'success')
          .then(() => this.router.navigate(['/admin/dynamic-dropdown-option-inquiry'], { queryParams: { tabName: 'Draft' } } ));
      },
      error: err => console.error('Save failed', err)
    });
  }

  // ---------------- UPDATE ----------------
  update(id:number): void {
    if (this.dropdownForm.invalid) return;

    const payload = this.dropdownForm.getRawValue();

    this.api.updateTnx(payload, 'dynamic-dropdown',id).subscribe({
      next: () => {
        Swal.fire('Updated!', 'Dropdown option updated successfully', 'success')
          .then(() => this.router.navigate(['/admin/dynamic-dropdown-option-inquiry'], { queryParams: { tabName: 'Draft' } }));
      },
      error: err => console.error('Update failed', err)
    });
  }

  
  
  // ---------------- UI HELPERS ----------------
 isReadOnly(): boolean {
  // New city (no storeCity) → editable
  if (!this.storeDropDown) {
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
    this.dropdownForm.reset();
  }
  submit() {    
    if (!this.storeDropDown?.id) return;
    this.api.setTnxByStatus('S', this.storeDropDown.id, 'city').subscribe({
      next: (res) => {
        console.log('Submited response:', res);
        Swal.fire('Submitted!', 'Dropdown option submitted successfully', 'success')
          .then(() => this.router.navigate(['/admin/city-list'],{ queryParams: { tabName: 'submitted' } }));
      },  
      error: err => console.error('Submit failed', err)
    });
  }

 


  reject(id:number): void { 
    if (!this.storeDropDown?.id) return;
    this.api.setTnxByStatus('I', this.storeDropDown.id, 'dynamic-dropdown').subscribe({
      next: () => {
        Swal.fire('Rejected!', 'Dropdown option rejected successfully', 'success')
          .then(() => this.router.navigate(['/admin/dynamic-dropdown-option-inquiry'],{ queryParams: { tabName: 'Rejected' } }));
      },
      error: err => console.error('Reject failed', err)
    });
  } 

  approve(id: number): void {
  if (!this.storeDropDown?.id) return;

  this.api.setTnxByStatus('A', this.storeDropDown.id, 'dynamic-dropdown').subscribe({
    next: () => {
      Swal.fire('Approved!', 'Dropdown option approved successfully', 'success')
        .then(() => 
          this.router.navigate(['/admin/dynamic-dropdown-option-inquiry'], { queryParams: { tabName: 'approved' } })
        );
    },
    error: err => console.error('Approve failed', err)
  });
}


}
