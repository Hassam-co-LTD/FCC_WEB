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
  selector: 'app-field-generation',
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
  templateUrl: './create-generate-fields.html',
  styleUrls: ['./create-generate-fields.scss']
})
export class CreateGenerateFields implements OnInit {

  fieldForm!: FormGroup;
  storeField: any = {};

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
    this.loadField();
  }

  private buildForm(): void {
    this.fieldForm = this.fb.group({
      fieldId: ['', Validators.required],
      fieldName: ['', Validators.required],
      label: ['', Validators.required],
      fieldType: ['', Validators.required],
      screen: ['', Validators.required]
    });
  }

  private loadField(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.isEditMode = true;
      this.api.getTnxById(id, 'DynamicFields').subscribe({
        next: res => {
          this.storeField = res;
          this.fieldForm.patchValue(res);
        },
        error: err => console.error('Load failed', err)
      });
    }
  }

  // ---------------- CREATE ----------------
  onSave(): void {
    if (this.fieldForm.invalid) return;

    const payload = this.fieldForm.getRawValue();
    this.api.saveTnx(payload, 'DynamicFields').subscribe({
      next: res => {
        console.log('Saved Field:', res);
        Swal.fire('Saved!', 'Field saved successfully', 'success')
          .then(() => this.router.navigate(['/admin/list-generate-fields']));
      },
      error: err => console.error('Save failed', err)
    });
  }

  // ---------------- UPDATE ----------------
  update(id:number): void {
    if (this.fieldForm.invalid) return;

    const payload = this.fieldForm.getRawValue();
    console.log('Updating Field with ID:', id, 'Payload:', payload);
    this.api.updateTnx(payload, 'DynamicFields', id).subscribe({
      next: (res) => {
        console.log('Updated Field:', res);
        Swal.fire('Updated!', 'Field updated successfully', 'success')
           
          .then(() => this.router.navigate(['/admin/list-generate-fields']));
      },
      error: err => console.error('Update failed', err)
    });
  }

  // ---------------- UI HELPERS ----------------
  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  onBack(): void {
    this.location.back();
  }

  onCancel(): void {
    this.fieldForm.reset();
  }

  submit() {
    if (!this.storeField?.id) return;
    this.api.setTnxByStatus('S', this.storeField.id, 'field-generation').subscribe({
      next: () => Swal.fire('Submitted!', 'Field submitted successfully', 'success'),
      error: err => console.error('Submit failed', err)
    });
  }

  reject(id:number): void {
    if (!this.storeField?.id) return;
    this.api.setTnxByStatus('D', this.storeField.id, 'field-generation').subscribe({
      next: () => Swal.fire('Rejected!', 'Field rejected successfully', 'success'),
      error: err => console.error('Reject failed', err)
    });
  }

  approve(id:number): void {
    if (!this.storeField?.id) return;
    this.api.setTnxByStatus('A', this.storeField.id, 'field-generation').subscribe({
      next: () => Swal.fire('Approved!', 'Field approved successfully', 'success'),
      error: err => console.error('Approve failed', err)
    });
  }

  isReadOnly(): boolean {
    // Draft editable, others read-only
    if (!this.storeField) return false;
    return this.storeField?.status === 'S' || this.storeField?.status === 'A';
  }
}
