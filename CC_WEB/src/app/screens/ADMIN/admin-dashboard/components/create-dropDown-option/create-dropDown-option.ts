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
import {AuthService}  from '../../../../../core/services/auth.service';
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
    private location: Location,
    private authService: AuthService  
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadDropdownOption();
  
  
  }

  private buildForm(): void {
    this.dropdownForm = this.fb.group({     
      name: ['', Validators.required],
      description: ['', Validators.required],
      createdBy:this.authService.getLoginId()
      
    });
  }

  private loadDropdownOption(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Loading dropdown option with ID:', id);
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

    const payload = {
      ...this.dropdownForm.getRawValue(),
      updatedBy: this.authService.getUserName() || ''
    };

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

  if (!this.storeDropDown) {
    return false;
  }
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
  const payload =  this.authService.getSubmitPayload()
  this.api.setTnxByStatus(
    payload,
    this.storeDropDown.id,
    'dynamic-dropdown'
  ).subscribe({
    next: (res) => {
      console.log('Submitted response:', res);

      Swal.fire(
        'Submitted!',
        'Dropdown option submitted successfully',
        'success'
      ).then(() =>
        this.router.navigate(
          ['/admin/dynamic-dropdown-option-inquiry'],
          { queryParams: { tabName: 'submitted' } }
        )
      );
    },
    error: err => console.error('Submit failed', err)
  });
}

 


  reject(id: number): void {
      
        if (!id) return;
      
        Swal.fire({
          title: 'Reject Transaction',
          input: 'textarea',
          inputLabel: 'Reject Reason',
          inputPlaceholder: 'Please enter the reason for rejection...',
          inputAttributes: {
            'aria-label': 'Reject reason'
          },
          showCancelButton: true,
          confirmButtonText: 'Reject',
          cancelButtonText: 'Cancel',
      
          preConfirm: (reason) => {
      
            if (!reason || !reason.trim()) {
      
              Swal.showValidationMessage(
                'Reject reason is required'
              );
      
              return false;
            }
      
            return reason.trim();
          }
      
        }).then((result) => {
      
          if (!result.isConfirmed) {
            return;
          }
      
          const rejectReason = result.value;
      
          // =========================
          // CREATE REJECT PAYLOAD
          // =========================
      
          const payload =
            this.authService.getRejectPayload(rejectReason);
      
          console.log('Reject ID:', id);
          console.log('Reject Payload:', payload);
      
          // =========================
          // CALL API
          // =========================
      
          this.api.setTnxByStatus(
            payload,
            id,
            'customer'
          ).subscribe({
      
            next: (res: any) => {
      
              console.log('Reject successful:', res);
      
              Swal.fire(
                'Rejected!',
                res?.message || 'dropDown rejected successfully',
                'success'
              ).then(() => {
      
                this.router.navigate(
                  ['/admin/customer-list'],
                  {
                    queryParams: {
                      tabName: 'rejected'
                    }
                  }
                );
      
              });
      
            },
      
            error: (err: any) => {
      
              console.error('Reject failed:', err);
      
              Swal.fire(
                'Error',
                err?.error?.message || 'Reject failed',
                'error'
              );
      
            }
      
          });
      
        });
      }

  approve(id: number): void {
  if (!this.storeDropDown?.id) return;

  const payload = this.authService.getApprovePayload()

  this.api.setTnxByStatus(payload, this.storeDropDown.id, 'dynamic-dropdown').subscribe({
    next: () => {
      Swal.fire('Approved!', 'Dropdown option approved successfully', 'success')
        .then(() => 
          this.router.navigate(['/admin/dynamic-dropdown-option-inquiry'], { queryParams: { tabName: 'approved' } })
        );
    },
    error: err => console.error('Approve failed', err)
  });
}

 amend(id: number): void {
  if (!this.storeDropDown?.id) return;

  const payload = this.authService.getAmendPayload()

  this.api.setTnxByStatus(payload, this.storeDropDown.id, 'dynamic-dropdown').subscribe({
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
