import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
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
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { ApiService } from '../../../../../../core/services/api.service';
import { AddAccountDialog } from './add-account-dialog/add-account-dialog';
import { DynamicFieldsResponseDto } from '../../create-generate-fields/create-generate-fields';

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
  templateUrl: './create-customer.html',
  styleUrls: ['./create-customer.scss']
})
export class CreateCustomer implements OnInit {

  customerForm!: FormGroup;
  storeCustomer: any = {};
  
  allCompanies: any[] = [];
  isEditMode = false;
  isOpen = true;
  storeCustomerResponseForAccounts: any = {};
  storeCustomerAccounts : any =  [];
  fields: DynamicFieldsResponseDto[] = [];
  // Add at the top of your class
dynamicFieldsForm: FormGroup = new FormGroup({});
isDynamicFieldsOpen = true;  // default open
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
    this.api.getFieldsByScreenAndStatus('customer', 'A').subscribe({
      next: res => {
        this.fields = res;
        console.log("got customer screens ", this.fields);
        // Initialize dynamic form controls
        this.fields.forEach(field => {
          this.dynamicFieldsForm.addControl(
            field.fieldName,
            this.fb.control('', Validators.required) // add validators if needed
          );
        });
      },
      error: err => console.error(err)
    });

    
  }


  private buildForm(): void {
    this.customerForm = this.fb.group({
     
      custId: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contact: ['', Validators.required],
      legalId: [''],
      customerStatus: ['Active'],  // default Active
      branchCode: [''],
      countryCity: [''],
      customerType: ['Regular', Validators.required],
      customerCategory: ['Bank', Validators.required],
      address1: [''],
      address2: [''],
      address3: ['']
    });
  }

  private loadCustomer(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Loading customer with ID:', id);
     if (!isNaN(id)) {
      this.isEditMode = true;

      this.api.getTnxById(id,"customer").subscribe({
        next: res => {
          this.storeCustomer = res;
          console.log('get Customer By:', res);
          this.customerForm.patchValue(res);
          this.getAllCustomerAccounts(this.storeCustomer?.custId)
        },
        error: err => console.error('Load failed', err)
      });
    }
  }

  private loadCompanies(): void {
    this.api.getTnxByStatus('A',"company").subscribe({
      next: companies =>{
           this.allCompanies = companies
           console.log('Fetched companies:', this.allCompanies);
      } ,
      error: err => console.error('Error fetching companies', err)
    });
  }
  // ---------------- CREATE ----------------
  onSave(): void {
    if (this.customerForm.invalid) return;

    const payload = this.customerForm.getRawValue();
    console.log('Payload to save:', payload);    
    this.api.saveTnx(payload, 'customer').subscribe({
      next: res => {
        console.log("Saved response:", res);
        this.storeCustomerResponseForAccounts = res;
        Swal.fire('Saved!', 'Customer saved successfully', 'success')
          
      },
      error: err => console.error('Save failed', err)
    });

  // save payload of dynamic fields
  const dynamicPayload = this.fields.map(field => ({
  id: field.fieldId,
  name: field.fieldName,
  label: field.label,
  type: field.fieldType,
  screen: field.screen,
  recordStatus: field.recordStatus,
  custId: payload.custId, // associate with customer
  
}));

console.log('Constructed Dynamic Fields Payload:', dynamicPayload);
    console.log('Dynamic Fields Payload on Save:', dynamicPayload);
    this.api.saveTnx(dynamicPayload, 'customer/Dynamicfields').subscribe({
      next: res => console.log('Dynamic fields saved:', res),
      error: err => console.error('Failed to save dynamic fields', err)
    });
  }

  // ---------------- UPDATE ----------------
  update(id:number): void {
    if (this.customerForm.invalid) return;

    const payload = this.customerForm.getRawValue();

    this.api.updateTnx(payload, 'customer',id).subscribe({
      next: () => {
        Swal.fire('Updated!', 'Customer updated successfully', 'success')
          .then(() => this.router.navigate(['/admin/create-customer', id]));
      },
      error: err => console.error('Update failed', err)
    });
  }

  
  activate(id: number): void {
    this.api.setTnxByStatus('Active', id, 'customer').subscribe({
      next: () => {
        Swal.fire('Activated!', 'Customer is now Active', 'success')
          .then(() => this.loadCustomer());
      },
      error: err => console.error('Activate failed', err)
    });
  }

  deactivate(id: number): void {
    this.api.setTnxByStatus('Inactive', id, 'customer').subscribe({
      next: () => {
        Swal.fire('Deactivated!', 'Customer is now Inactive', 'success')
          .then(() => this.loadCustomer());
      },
      error: err => console.error('Deactivate failed', err)
    });
  }

  // ---------------- UI HELPERS ----------------
 isReadOnly(): boolean {
  // New customer (no storeCustomer) → editable
  if (!this.storeCustomer) {
    return true;
  }

  // Existing customer:
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
    this.customerForm.reset();
  }
  submit() {    
    if (!this.storeCustomer?.id) return;
    this.api.setTnxByStatus('S', this.storeCustomer.id, 'customer').subscribe({
      next: (res) => {
        console.log('Submited response:', res);
        Swal.fire('Submitted!', 'Customer submitted successfully', 'success')
          .then(() => this.router.navigate(['/admin/customer-list'],{ queryParams: { tabName: 'submitted' } }));
      },  
      error: err => console.error('Submit failed', err)
    });
  }

 


  reject(id:number): void { 
    if (!this.storeCustomer?.id) return;
    this.api.setTnxByStatus('I', this.storeCustomer.id, 'customer').subscribe({
      next: () => {
        Swal.fire('Rejected!', 'Customer rejected successfully', 'success')
          .then(() => this.router.navigate(['/admin/customer-list'],{ queryParams: { tabName: 'Rejected' } }));
      },
      error: err => console.error('Reject failed', err)
    });
  } 

  approve(id: number): void {
  if (!this.storeCustomer?.id) return;

  this.api.setTnxByStatus('A', this.storeCustomer.id, 'customer').subscribe({
    next: () => {
      Swal.fire('Approved!', 'Customer approved successfully', 'success')
        .then(() => 
          this.router.navigate(['/admin/customer-list'], { queryParams: { tabName: 'approved' } })
        );
    },
    error: err => console.error('Approve failed', err)
  });
}



// ---------------- ADD ACCOUNT DIALOG ----------------
openAddAccountDialog( customerId: number, customerName: string): void {
  const dialogRef = this.dialog.open(AddAccountDialog, {
    width: '600px',
    data: { customerId: customerId, customerName: customerName }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // result contains the new account data
      console.log('New Account:', result);

      // TODO: call service to save account for this customer
      this.addAccountToCustomer(result);
    }
  });
}

addAccountToCustomer(accountData: any) {
  // Example: push to customer's accounts array or call backend API
  if (!this.storeCustomer.accounts) {
    this.storeCustomer.accounts = [];
  }
  this.storeCustomer.accounts.push(accountData);
}

// getAllCustomerAccounts

getAllCustomerAccounts(custId:String){
     this.api.getCustomerAccounts(custId,'accounts').subscribe({
        next:res=> {
           console.log("got all customer Accounts",res)
           this.storeCustomerAccounts = res;
        }
        ,
        error:err=> {
           console.log("got error while fetching all customer accounts ",err);
        }
     })
}


getCompanyName(companyId: number): string {
  const company = this.allCompanies?.find(
    c => c.companyId === companyId
  );
  return company ? company.companyName : 'N/A';
}
 
  toggleDynamicFields() {
  this.isDynamicFieldsOpen = !this.isDynamicFieldsOpen;
}
}
