import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
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

export interface DynamicFieldsResponseDto {
  fieldId: number;
  fieldName: string;
  label: string;
  fieldType: string;
  screen: string;
  recordStatus: string;
  options?: { id: number, value: string, text: string }[];
  createdOn?: string;
  updatedOn?: string;
}

@Component({
  selector: 'app-dynamic-fields',
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
    MatFormField
  ],
  templateUrl: './create-generate-fields.html',
  styleUrls: ['./create-generate-fields.scss'],
})
export class CreateGenerateFields implements OnInit {

  fieldForm!: FormGroup;
  storeField: any = {};
  isEditMode = false;
  isOpen = true;
  maxOptions = 5;

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

  // Ensure FormArray has at least one option for 'select' type
  if (this.fieldForm.get('fieldType')?.value === 'select' && this.options.length === 0) {
    this.addOption();
  }

  // Watch fieldType changes
  this.fieldForm.get('fieldType')?.valueChanges.subscribe(type => {
    if (type === 'select' && this.options.length === 0) {
      this.addOption();
    } else if (type !== 'select') {
      this.options.clear();
    }
  });
}
  private buildForm(): void {
    this.fieldForm = this.fb.group({
      fieldId: ['', Validators.required],
      fieldName: ['', Validators.required],
      label: ['', Validators.required],
      fieldType: ['', Validators.required],
      screen: ['', Validators.required],
      options: this.fb.array([]) // <-- FormArray starts empty, populate later
    });
  }

  get options(): FormArray {
    return this.fieldForm.get('options') as FormArray;
  }

  private createOption(fieldId: string , value:string, text:string, dropDownKey: string): FormGroup {
    return this.fb.group({
      fieldId: [fieldId, Validators.required],
      value: [value, Validators.required],
      text: [text, Validators.required],
      dropDownKey: [dropDownKey] // Optional: can be used for additional logic
    });
  }

  addOption(): void {
    if (this.options.length >= this.maxOptions) return;
    this.options.push(this.createOption('', '', '', ''));
  }

  removeOption(index: number): void {
    if (this.options.length > 1) {
      this.options.removeAt(index);
    }
  }

  private loadField(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.isEditMode = true;
      this.api.getTnxById(id, 'dynamic-fields').subscribe({
        next: res => {
          this.storeField = res;
          console.log('get by id:', this.storeField);
          this.fieldForm.patchValue(res);

          if (res.fieldType === 'select' && res.options?.length) {
            this.options.clear();
            res.options.forEach((opt: any) => this.options.push(this.createOption(opt.id, opt.value, opt.text, opt.dropDownKey)));
          } else if (res.fieldType === 'select') {
            this.addOption(); // ensure at least one option exists
          }
        },
        error: err => console.error('Load failed', err)
      });
    }
  }

  isReadOnly(): boolean {
    return this.storeField?.recordStatus === 'A' || this.storeField?.recordStatus === 'S';
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  onBack(): void {
    this.location.back();
  }

  onCancel(): void {
    this.fieldForm.reset();
    this.options.clear();
  }

  onSave(): void {
    if (this.fieldForm.invalid) return;

    const payload = this.fieldForm.getRawValue();
    console.log('Saving payload:', payload);
    this.api.saveTnx(payload, 'dynamic-fields').subscribe({
      next: (res) =>{
        console.log('Saved response:', res) 
         Swal.fire('Saved!', 'Field saved successfully', 'success')
        .then(() => this.router.navigate(['/admin/dynamic-field-inquiry'], { queryParams: { tabName: 'Draft' } }));
        },
      error: err => console.error('Save failed', err)
    });
  }

  update(id: number): void {
    if (this.fieldForm.invalid) return;
    const payload = this.fieldForm.getRawValue();
    console.log('Updating payload:', payload);
    this.api.updateTnx(payload, 'dynamic-fields', id).subscribe({
      next: (res)=>{ 
        console.log('Updated response:', res)
        Swal.fire('Updated!', 'Field updated successfully', 'success')
        .then(() => this.router.navigate(['/admin/dynamic-field-inquiry'], { queryParams: { tabName: 'Draft' } }))
    },
      error: err => console.error('Update failed', err)
    });
  }

  submit(): void {
    if (!this.storeField?.id) return;
    this.api.setTnxByStatus('S', this.storeField.id, 'dynamic-fields').subscribe({
      next: () => Swal.fire('submitted!', 'Dynamic Field submitted', 'success')
        .then(() => this.router.navigate(['/admin/dynamic-field-inquiry'], { queryParams: { tabName: 'Submitted' } })),
      error: err => Swal.fire('Error', 'Submit failed', 'error')
    });
  }

  reject(id: number): void {
    if (!this.storeField?.id) return;
    this.api.setTnxByStatus('I', this.storeField.id, 'dynamic-fields').subscribe({
      next: () => Swal.fire('Rejected!', 'Field rejected', 'success')
        .then(() => this.router.navigate(['/admin/dynamic-field-inquiry'], { queryParams: { tabName: 'Draft' } })),
      error: err => Swal.fire('Error', 'Rejection failed', 'error')
    });
  }

  approve(id: number): void {
    if (!this.storeField?.id) return;
    this.api.setTnxByStatus('A', this.storeField.id, 'dynamic-fields').subscribe({
      next: () => Swal.fire('Approved!', 'Field approved', 'success')
        .then(() => this.router.navigate(['/admin/dynamic-field-inquiry'], { queryParams: { tabName: 'Approved' } })),
      error: err => Swal.fire('Error', 'Approval failed', 'error')
    });
  }

}