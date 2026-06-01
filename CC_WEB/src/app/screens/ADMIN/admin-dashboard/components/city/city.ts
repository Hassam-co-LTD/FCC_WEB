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
import { MatCard } from '@angular/material/card';

import Swal from 'sweetalert2';
import { ApiService } from '../../../../../core/services/api.service';

@Component({
selector: 'app-city',
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
MatCard
],
templateUrl: './city.html',
styleUrls: ['./city.scss']
})
export class City implements OnInit {

cityForm!: FormGroup;
dynamicFieldsForm!: FormGroup;

storeCity: any = {};
fields: any[] = [];
storeDynamicFieldsResponse: any[] = [];

isEditMode = false;
isOpen = true;
isDynamicFieldsOpen = true;

constructor(
private fb: FormBuilder,
private api: ApiService,
private router: Router,
private route: ActivatedRoute,
private location: Location
) {}

ngOnInit(): void {
this.buildForm();
this.loadCity();
this.loadDynamicFields();
}

// ================= FORM =================
private buildForm(): void {
this.cityForm = this.fb.group({
cityId: [''],
cityName: ['', Validators.required],
state: ['', Validators.required],
country: ['', Validators.required],
});
}

// ================= LOAD CITY =================
private loadCity(): void {
const id = this.route.snapshot.paramMap.get('id');
if (!id) return;
this.isEditMode = true;
this.api.getTnxById(id, 'city').subscribe({
next: (res: any) => {
console.log('Loaded City:', res);
this.storeCity = res;
this.storeDynamicFieldsResponse = res.dynamicFields || [];
this.cityForm.patchValue(res);
this.patchDynamicValues();
},
error: (err: any) => console.error('Load failed', err)
});
}

// ================= LOAD DYNAMIC FIELDS =================
private loadDynamicFields(): void {
this.api.getFieldsByScreenAndStatus('city', 'A').subscribe({
next: (res: any) => {
console.log('City Dynamic Fields:', res);
this.fields = res;
const group: any = {};
this.fields.forEach((f: any) => {
  group[f.fieldName] = [''];
});
this.dynamicFieldsForm = this.fb.group(group);
this.patchDynamicValues();
},
error: (err: any) => console.error('Dynamic field load failed', err)
});
}

// ================= PATCH DYNAMIC =================
private patchDynamicValues(): void {
if (!this.dynamicFieldsForm || !this.fields?.length || !this.storeDynamicFieldsResponse?.length) return;
const patch: any = {};
this.storeDynamicFieldsResponse.forEach((saved: any) => {
const def = this.fields.find((f: any) => f.fieldId == saved.fieldId);
if (def) patch[def.fieldName] = saved.value || '';
});
this.dynamicFieldsForm.patchValue(patch);
}

// ================= SAVE =================
// ================= SAVE CITY =================
onSave(): void {

  if (this.cityForm.invalid || this.dynamicFieldsForm.invalid) return;

  // 1️⃣ City data
  const cityData = this.cityForm.getRawValue();

  // 2️⃣ Dynamic fields
  const dynamicFields = this.fields.map(f => ({
    fieldId: f.fieldId,
    value: this.dynamicFieldsForm.get(f.fieldName)?.value || '',
    cityId:this.cityForm.value.cityId
  }));

  // 3️⃣ FINAL COMBINED PAYLOAD
  const payload = {
    ...cityData,
    dynamicFields: dynamicFields
  };

  console.log("Final Payload:", payload);
  
  // 4️⃣ SINGLE API CALL
  this.api.saveTnx(payload, 'city').subscribe({
    next: (res: any) => {
      console.log('City saved:', res);

      Swal.fire('Saved!', 'City saved successfully', 'success');
    },
    error: (err: any) => {
      console.error('Save failed', err);
      Swal.fire('Error', 'City save failed', 'error');
    }
  });
}
// ================= UPDATE CITY =================
updateCity(): void {
  if (this.cityForm.invalid) return;

  const cityId = this.cityForm.value.cityId;

  // 1️⃣ Merge city form data with dynamic fields
  const dynamicPayload = this.fields?.map(f => ({
    fieldId: f.fieldId,
    value: this.dynamicFieldsForm.get(f.fieldName)?.value || ''
  })) || [];

  const cityPayload = {
    ...this.cityForm.getRawValue(),
    dynamicFields: dynamicPayload,
    updatedOn: new Date().toISOString().split('.')[0] // format: 2026-04-07T15:30:00
  };

  // 2️⃣ Send single update request
  this.api.updateTnxx(cityPayload, `city/update/${cityId}`).subscribe({
    next: () => console.log('City and dynamic fields updated successfully'),
    error: (err) => console.error('City update failed', err)
  });
}
// ================= WORKFLOW =================
submit(): void {
if (!this.storeCity?.id) return;

this.api.setTnxByStatus('S', this.storeCity.id, 'city').subscribe({
next: () =>
Swal.fire('Submitted!', 'City submitted successfully', 'success')
  .then(() =>
    this.router.navigate(['/admin/city-list'], {
      queryParams: { tabName: 'submitted' }
    })
  )
});
}

reject(id: number): void {
this.api.setTnxByStatus('I', id, 'city').subscribe({
next: () =>
Swal.fire('Rejected!', 'City rejected successfully', 'success')
  .then(() =>
    this.router.navigate(['/admin/city-list'], {
      queryParams: { tabName: 'Rejected' }
    })
  )
});
}

approve(id: number): void {
this.api.setTnxByStatus('A', id, 'city').subscribe({
next: () =>
Swal.fire('Approved!', 'City approved successfully', 'success')
  .then(() =>
    this.router.navigate(['/admin/city-list'], {
      queryParams: { tabName: 'approved' }
    })
  )
});
}

// ================= UI HELPERS =================
toggle(): void { this.isOpen = !this.isOpen; }
toggleDynamicFields(): void { this.isDynamicFieldsOpen = !this.isDynamicFieldsOpen; }

onBack(): void { this.location.back(); }
onCancel(): void { this.cityForm.reset(); }

isReadOnly(): boolean {
return this.storeCity?.recordStatus === 'A';
}



} 