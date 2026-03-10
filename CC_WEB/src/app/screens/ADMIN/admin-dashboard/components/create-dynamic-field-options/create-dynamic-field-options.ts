import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
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
    MatNativeDateModule
  ],
  templateUrl: './create-dynamic-field-options.html',
  styleUrls: ['./create-dynamic-field-options.scss']
})
export class CreateDynamicFieldOptions implements OnInit {

  dropdownForm!: FormGroup;
  storeDropdown: any = {};

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
    // Initialize the form properly with values FormArray
    this.dropdownForm = this.fb.group({
      label: ['', Validators.required],
      screen: ['', Validators.required],
      dropDown: ['', Validators.required],
      values: this.fb.array([]) // <-- important to initialize FormArray
    });

    this.loadCustomer();
  }

  // =========================
  // VALUES FORM ARRAY
  // =========================
  get values(): FormArray {
    return this.dropdownForm.get('values') as FormArray;
  }

 addValue(label?: string) {
  const nextValue = this.values.length + 1; // auto-increment value
  this.values.push(this.fb.group({
    value: [nextValue, Validators.required],   // auto-incremented
    label: [label || '', Validators.required]  // user can enter label
  }));
}

  removeValue(index: number) {
    this.values.removeAt(index);
  }

  // Initialize default 5 empty values
  initValues() {
    this.values.clear();
    for (let i = 0; i < 5; i++) {
      this.addValue();
    }
  }

  // Patch existing values from backend
  patchValues(existingValues: any[]) {
    this.values.clear();
    if (!existingValues || existingValues.length === 0) {
      this.initValues();
    } else {
      existingValues.forEach(v => this.addValue(v));
    }
  }

  // ---------------- LOAD CUSTOMER ----------------
  private loadCustomer(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.isEditMode = true;
      this.api.getTnxById(id, 'dropdown-values').subscribe({
        next: res => {
          this.storeDropdown = res;
          this.dropdownForm.patchValue({
            label: res.label,
            screen: res.screen,
            dropDown: res.dropDown
          });
          this.patchValues(res.values);
        },
        error: err => console.error('Load failed', err)
      });
    } else {
      this.initValues();
    }
  }

  // ---------------- CREATE / UPDATE ----------------
  onSave(): void {
    if (this.dropdownForm.invalid) return;
    const payload = this.dropdownForm.getRawValue();
    console.log('Payload to save:', payload);
    this.api.saveTnx(payload, 'dropdown-values').subscribe({
      next: res => {
        console.log("Saved response:", res);
        Swal.fire('Saved!', 'Dropdown saved successfully', 'success')
          .then(() => this.router.navigate(['/admin/dynamic-field-options-inquiry'], { queryParams: { tabName: 'Draft' } }));
      },
      error: err => console.error('Save failed', err)
    });
  }

  update(id: number): void {
    if (this.dropdownForm.invalid) return;
    const payload = this.dropdownForm.getRawValue();
    this.api.updateTnx(payload, 'dropdown', id).subscribe({
      next: () => {
        Swal.fire('Updated!', 'Dropdown updated successfully', 'success')
          .then(() => this.router.navigate(['/admin/dropdown-list'], { queryParams: { tabName: 'Draft' } }));
      },
      error: err => console.error('Update failed', err)
    });
  }

  submit() {
    if (!this.storeDropdown?.id) return;
    this.api.setTnxByStatus('S', this.storeDropdown.id, 'dropdown').subscribe({
      next: () => {
        Swal.fire('Submitted!', 'Dropdown submitted successfully', 'success')
          .then(() => this.router.navigate(['/admin/dropdown-list'], { queryParams: { tabName: 'submitted' } }));
      },
      error: err => console.error('Submit failed', err)
    });
  }

  reject(id: number) {
    if (!this.storeDropdown?.id) return;
    this.api.setTnxByStatus('I', this.storeDropdown.id, 'dropdown').subscribe({
      next: () => {
        Swal.fire('Rejected!', 'Dropdown rejected successfully', 'success')
          .then(() => this.router.navigate(['/admin/dropdown-list'], { queryParams: { tabName: 'Rejected' } }));
      },
      error: err => console.error('Reject failed', err)
    });
  }

  approve(id: number) {
    if (!this.storeDropdown?.id) return;
    this.api.setTnxByStatus('A', this.storeDropdown.id, 'dropdown').subscribe({
      next: () => {
        Swal.fire('Approved!', 'Dropdown approved successfully', 'success')
          .then(() => this.router.navigate(['/admin/dropdown-list'], { queryParams: { tabName: 'approved' } }));
      },
      error: err => console.error('Approve failed', err)
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
    this.dropdownForm.reset();
    this.initValues();
  }
}