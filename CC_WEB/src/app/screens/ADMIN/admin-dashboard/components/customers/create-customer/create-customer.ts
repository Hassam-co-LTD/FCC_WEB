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
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { ApiService } from '../../../../../../core/services/api.service';
import { AddAccountDialog } from './add-account-dialog/add-account-dialog';

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
  ],
  templateUrl: './create-customer.html',
  styleUrls: ['./create-customer.scss']
})
export class CreateCustomer implements OnInit {

  customerForm!: FormGroup;
  dynamicFieldsForm!: FormGroup;

  storeCustomer: any = {};
  storeDynamicFieldsResponse: any[] = [];
  storeCustomerAccounts: any = {};
  fields: any[] = [];
  allCompanies: any[] = [];

  storeCustomerResponseForAccounts: any = {};

  isOpen = true;
  isAccountsOpen = true;
  isDynamicFieldsOpen = true;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {

    this.buildForm();
    this.loadCustomer();
    this.loadCompanies();
    this.loadDynamicFields();
    this.loadDropdownOptions();
  }

  // ---------------- FORM ----------------

  
  private buildForm(): void {

    this.customerForm = this.fb.group({
      custId: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contact: ['', Validators.required],
      legalId: [''],
      customerStatus: ['Active'],
      branchCode: [''],
      countryCity: [''],
      customerType: ['Regular', Validators.required],
      customerCategory: ['Bank', Validators.required],
      address1: [''],
      address2: [''],
      address3: ['']
    });

  }

  // ---------------- LOAD CUSTOMER ----------------

  private loadCustomer(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) return;

    this.isEditMode = true;

    this.api.getTnxById(id, "customer").subscribe({

      next: (res: any) => {

        console.log("Loaded customer:", res);

        this.storeCustomer = res;
        this.storeDynamicFieldsResponse = res.dynamicFields || [];

        this.customerForm.patchValue(res);

        this.getAllCustomerAccounts(res?.custId);

        // if fields already loaded then patch
        this.patchDynamicValues();

      },

      error: (err: any) => console.error('Load failed', err)

    });

  }

  // ---------------- LOAD DYNAMIC FIELD DEFINITIONS ----------------

  private loadDynamicFields(): void {

    this.api.getFieldsByScreenAndStatus('customer', 'A').subscribe({

      next: (res: any) => {

        console.log("Field definitions:", res);

        this.fields = res;

        const group: any = {};

        this.fields.forEach((field: any) => {
          group[field.fieldName] = [''];
        });

        this.dynamicFieldsForm = this.fb.group(group);

        // patch values if customer already loaded
        this.patchDynamicValues();

      },

      error: (err: any) => console.error('Error loading dynamic fields:', err)

    });

  }

  // ---------------- PATCH DYNAMIC VALUES ----------------

  private patchDynamicValues(): void {

    if (!this.dynamicFieldsForm || !this.fields?.length || !this.storeDynamicFieldsResponse?.length) return;

    const patchObj: any = {};

    this.storeDynamicFieldsResponse.forEach((savedField: any) => {

      const fieldDefinition = this.fields.find(
        (f: any) => f.fieldId == savedField.fieldId
      );

      if (fieldDefinition) {
        patchObj[fieldDefinition.fieldName] = savedField.value || '';
      }

    });

    console.log("Dynamic patch object:", patchObj);

    this.dynamicFieldsForm.patchValue(patchObj);

  }

  // ---------------- LOAD COMPANIES ----------------

  private loadCompanies(): void {

    this.api.getTnxByStatus('A', "company").subscribe({
      next: (companies: any) => this.allCompanies = companies,
      error: (err: any) => console.error('Error fetching companies', err)
    });

  }

  // ---------------- SAVE ----------------

  onSave(): void {

    if (this.customerForm.invalid) return;

    const payload = this.customerForm.getRawValue();

    this.api.saveTnx(payload, 'customer').subscribe({

      next: (res: any) => {

        this.storeCustomerResponseForAccounts = res;

        Swal.fire('Saved!', 'Customer saved successfully', 'success')
                .then(() =>
          this.router.navigate(['/admin/customer-list'], {
            queryParams: { tabName: 'draft' }
          })
        ),
          console.log('Customer saved:', res);

      },

      error: (err: any) => console.error('Save failed', err)

    });

    const formValues = this.dynamicFieldsForm.value;

    const dynamicPayload = this.fields.map((f: any) => ({

      fieldId: f.fieldId,
      value: formValues[f.fieldName],
      custId: this.customerForm.value.custId

    }));

    this.api.saveTnx(dynamicPayload, 'customer/Dynamicfields').subscribe({

      next: (res: any) => console.log('Dynamic fields saved:', res),

      error: (err: any) => console.error('Failed to save dynamic fields', err)

    });

  }

  // ---------------- UPDATE ----------------
updateCustomer(): void {
  if (this.customerForm.invalid || this.dynamicFieldsForm.invalid) return;

  const custId = this.customerForm.value.custId;

  // 1️⃣ Main customer payload
  const customerPayload = this.customerForm.getRawValue();

  // 2️⃣ Dynamic fields payload
  const dynamicPayload = this.fields.map(f => ({
    fieldId: f.fieldId,
    custId: custId,
    value: this.dynamicFieldsForm.get(f.fieldName)?.value || ''
  }));

  // 3️⃣ Update main customer using custId
  this.api.updateTnxx(customerPayload, `customer/byCustId/${custId}`).subscribe({
    next: () => {

      // 4️⃣ Update dynamic fields using fieldId
      this.api.updateTnxx(dynamicPayload, 'customer/Dynamicfield').subscribe({
        next: () => {
          // ✅ Success popup
          Swal.fire({
            title: 'Updated!',
            text: 'Customer and Additional Fields updated successfully',
            icon: 'success',
            confirmButtonText: 'OK'
          });

          // 5️⃣ Refresh form with latest values
          this.api.getTnxById(custId, 'customer').subscribe({
            next: (res) => {
              this.customerForm.patchValue(res);

              if (res.dynamicFields?.length) {
                res.dynamicFields.forEach((field: any) => {
                 const fieldDef = this.fields.find(f => f.fieldId === field.fieldId);
if (fieldDef && this.dynamicFieldsForm.contains(fieldDef.fieldName)) {
  this.dynamicFieldsForm.get(fieldDef.fieldName)?.setValue(field.value);
}
                });
              }
            },
            error: (err) => {
              console.error('Failed to reload customer', err);
              Swal.fire({
                title: 'Reload Failed',
                text: 'Could not fetch updated customer data',
                icon: 'error',
                confirmButtonText: 'OK'
              });
            }
          });
        },
        error: (err) => {
          console.error('Failed to update dynamic fields', err);
          Swal.fire({
            title: 'Update Failed',
            text: 'Failed to update additional fields',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      });

    },
    error: (err) => {
      console.error('Failed to update customer', err);
      Swal.fire({
        title: 'Update Failed',
        text: 'Failed to update customer information',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  });
}  // ---------------- UI HELPERS ----------------

  isReadOnly(): boolean {
    return this.storeCustomer?.recordStatus === 'A';
  }

  toggle(): void { this.isOpen = !this.isOpen; }
  toggleAccounts(): void { this.isAccountsOpen = !this.isAccountsOpen; }
  toggleDynamicFields(): void { this.isDynamicFieldsOpen = !this.isDynamicFieldsOpen; }

  onBack(): void { this.location.back(); }

  onCancel(): void { this.customerForm.reset(); }

  // ---------------- WORKFLOW ----------------

  submit(): void {

    if (!this.storeCustomer?.id) return;

    this.api.setTnxByStatus('S', this.storeCustomer.id, 'customer').subscribe({

      next: () =>
        Swal.fire('Submitted!', 'Customer submitted successfully', 'success')
        .then(() =>
          this.router.navigate(['/admin/customer-list'], {
            queryParams: { tabName: 'submitted' }
          })
        ),

      error: (err: any) => console.error('Submit failed', err)

    });

  }

  reject(id: number): void {

    this.api.setTnxByStatus('I', id, 'customer').subscribe({

      next: () =>
        Swal.fire('Rejected!', 'Customer rejected successfully', 'success')
        .then(() =>
          this.router.navigate(['/admin/customer-list'], {
            queryParams: { tabName: 'Rejected' }
          })
        ),

      error: (err: any) => console.error('Reject failed', err)

    });

  }

  approve(id: number): void {

    this.api.setTnxByStatus('A', id, 'customer').subscribe({

      next: () =>
        Swal.fire('Approved!', 'Customer approved successfully', 'success')
        .then(() =>
          this.router.navigate(['/admin/customer-list'], {
            queryParams: { tabName: 'approved' }
          })
        ),

      error: (err: any) => console.error('Approve failed', err)

    });

  }

  // ---------------- ACCOUNTS ----------------

  openAddAccountDialog(customerId: number, customerName: string): void {

    const dialogRef = this.dialog.open(AddAccountDialog, {
      width: '600px',
      data: { customerId, customerName }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) this.addAccountToCustomer(result);
    });

  }

  addAccountToCustomer(accountData: any) {

    if (!this.storeCustomer.accounts) this.storeCustomer.accounts = [];

    this.storeCustomer.accounts.push(accountData);

  }

  getAllCustomerAccounts(custId: any) {

    this.api.getCustomerAccounts(custId, 'accounts').subscribe({

      next: (res: any) => this.storeCustomerAccounts = res,

      error: (err: any) => console.error("Error fetching customer accounts", err)

    });

  }

  getCompanyName(companyId: any): string {

    const company = this.allCompanies?.find((c: any) => c.companyId === companyId);

    return company ? company.companyName : 'N/A';

  }

  
  loadDropdownOptions(): void {
    this.api.findByRecordStatusAndScreenAndDropDown('A', 'customers', 'customerType').subscribe({
      next: res => {
        console.log('Dropdown options loaded:', res);
        // Handle dropdown options as needed
      },
      error: err => console.error('Failed to load dropdown options', err)
    });
  }

}