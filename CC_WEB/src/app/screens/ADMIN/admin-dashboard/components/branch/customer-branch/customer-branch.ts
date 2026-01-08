import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { CommonModule, Location } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../../../../core/services/api.service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-branch',
  templateUrl: './customer-branch.html',
  styleUrls: ['./customer-branch.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    CommonModule,
    MatIconModule
  ],
})
export class CustomerBranch implements OnInit {
  branchForm!: FormGroup;
  getAllCities: any[] = [];
  getBranchById: any;

  isBranchOpen: boolean = true;
  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private route: Router,
    private activateRouter: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit() {
    this.initForm();
    this.getAllCitiesList();
    this.getDraftBranchById();
  }

  //  toggleBranch() {
  //   this.isBranchOpen = !this.isBranchOpen;
  // }
  private initForm() {
    this.branchForm = this.fb.group({
      branchId: ['', Validators.required],
      branchName: ['', Validators.required],
      branchAddress: ['', Validators.required],
      cityId: ['', Validators.required],
      contactPerson: ['', Validators.required],
      contactNo: ['', Validators.required],
      swiftAddress: [''],
      emailAddress: [''],
      localCurrency: [''],
      recordStatus: ['A', Validators.required]
    });
  }

  cancel() {
    this.branchForm.reset();
  }

  private getPayload() {
    const f = this.branchForm.value;
    return {
      branchid: f.branchId,
      branchname: f.branchName,
      branchaddress: f.branchAddress,
      contactperson: f.contactPerson,
      contactno: f.contactNo,
      swiftaddress: f.swiftAddress,
      emailaddress: f.emailAddress,
      localcurrency: f.localCurrency,
      citymaster: { id: f.cityId },
      recordstatus: f.recordStatus
    };
  }

  private mapDraftToForm(res: any) {
    return {
      branchId: res.branchId || '',
      branchName: res.branchname || '',
      branchAddress: res.branchaddress || '',
      contactPerson: res.contactperson || '',
      contactNo: res.contactno || '',
      swiftAddress: res.swiftaddress || '',
      emailAddress: res.emailaddress || '',
      localCurrency: res.localcurrency || '',
      recordStatus: res.recordstatus || 'A',
      cityId: res.citymaster?.id || ''
    };
  }

  getAllCitiesList() {
    this.api.getAllCities().subscribe({
      next: (res: any) => {
        this.getAllCities = res;
        console.log("getAllCities",this.getAllCities);
        if (this.getBranchById?.citymaster?.id) {
          this.branchForm.patchValue({ cityId: this.getBranchById.citymaster.id });
          
        }
      },
      error: (err) => console.log(err)
    });
  }

  getDraftBranchById() {
    const id = Number(this.activateRouter.snapshot.paramMap.get("id"));
    // console.log(typeof (id), "this is the id",id )
    if (!id) return;

    this.api.getSearchById(id).subscribe({
      next: (res: any) => {
          this.getBranchById = res;
        console.log("this is the status", this.getBranchById.branchstatus);
        if (res) this.branchForm.patchValue(this.mapDraftToForm(res));
      },
      error: (err) => console.log("Error fetching draft:", err)
    });
  }

  save() {
    this.api.saveBranch(this.getPayload()).subscribe({
      next: (res: any) => {
        Swal.fire({
          title: 'Success!',
          text: 'Your form was approved!',
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: { popup: 'swal2-top-left' },
        });
        this.route.navigate(["/admin/branch-list"]);
      },
      error: (err: any) => {
        console.log("Error while saving data:", err);
        Swal.fire({
          title: 'Error',
          text: `Got error: ${err}`,
          icon: 'error',
          confirmButtonText: 'OK',
          customClass: { popup: 'swal2-top-left' },
        });
      }
    });
  }

  update(id: number) {
    this.api.updateDraftBranch(id, this.getPayload()).subscribe({
      next: (res: any) => {
        Swal.fire({
          title: 'Success!',
          text: 'Your form was updated successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: { popup: 'swal2-top-left' },
        });
        this.route.navigate(["/admin/create-branch", id])
      },
      error: (err) => console.log("Error updating branch:", err)
    });
  }

  back() {
    this.location.back();
  }

  submit() {
    this.api.submitDraftBranch(this.getBranchById.id).subscribe({
      next: res => {
        Swal.fire({
          title: 'Success!',
          text: 'Status updated successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: { popup: 'swal2-top-left' },
        });
       this.route.navigate(['/admin/branch-list'], { 
  queryParams: { tabName: 'Submitted' } 
});
      },
      error: err => console.log("Error while submitting data", err)
    });
  }

  reject(id: number) {
    this.api.rejectSubmitted(id).subscribe({
      next: res => this.route.navigate(["/admin/branch-list"]),
      error: err => console.log("Error while rejecting branch", err)
    });
  }

  approved(id: number) {
    this.api.approved(id).subscribe({
      next: res => {
        this.getBranchById = res;
        Swal.fire({
          title: 'Success!',
          text: 'Status Updated to Approved',
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: { popup: 'swal2-top-left' },
        });
       this.route.navigate(['/admin/branch-list'], { 
  queryParams: { tabName: 'Approved' } 
});;
      },
      error: err => console.log("Error while approving branch", err)
    });
  }

isOpen = true;
toggle(): void {
  this.isOpen = !this.isOpen;
}

}
