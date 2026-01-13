import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../../../core/services/api.service';

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
  allCities: any[] = [];
  branchDetails: any;
  isOpen = true;

  private endpoint = 'branch'; // used in ApiService methods

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private route: Router,
    private activateRouter: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadCities();
    this.loadBranchDraft();
  }

  private initForm() {
    this.branchForm = this.fb.group({
      branchCode: ['', Validators.required],
      branchName: ['', Validators.required],
      branchAddress: ['', Validators.required],
      cityId: ['', Validators.required],
      contactPerson: ['', Validators.required],
      contactNo: ['', Validators.required],
      swiftAddress: [''],
      emailAddress: [''],
      localCurrency: [''],
      recordStatus: ['D', Validators.required]
    });
  }

  cancel() {
    this.branchForm.reset();
  }

  private getPayload() {
    const f = this.branchForm.value;
    return {
      branchCode: f.branchCode,
      branchName: f.branchName,
      branchAddress: f.branchAddress,
      contactPerson: f.contactPerson,
      contactNo: f.contactNo,
      swiftAddress: f.swiftAddress,
      emailAddress: f.emailAddress,
      localCurrency: f.localCurrency,
      recordStatus: f.recordStatus,
      cityMaster: { id: f.cityId }
    };
  }

  private mapDraftToForm(res: any) {
    return {
      branchCode: res.branchCode || '',
      branchName: res.branchName || '',
      branchAddress: res.branchAddress || '',
      contactPerson: res.contactPerson || '',
      contactNo: res.contactNo || '',
      swiftAddress: res.swiftAddress || '',
      emailAddress: res.emailAddress || '',
      localCurrency: res.localCurrency || '',
      recordStatus: res.recordStatus || 'D',
      cityId: res.cityMaster?.id || ''
    };
  }

  loadCities() {
    this.api.getTnxByStatus('all', 'cities').subscribe({  // using generic service
      next: (res: any) => this.allCities = res,
      error: err => console.log("Error loading cities", err)
    });
  }

  loadBranchDraft() {
    const id = Number(this.activateRouter.snapshot.paramMap.get("id"));
    if (!id) return;

    this.api.getCityById(id).subscribe({ // reuse generic getCityById method
      next: (res: any) => {
        this.branchDetails = res;
        if (res) this.branchForm.patchValue(this.mapDraftToForm(res));
      },
      error: err => console.log("Error loading branch draft", err)
    });
  }

  saveBranch() {
    this.api.saveTnx(this.getPayload(), this.endpoint).subscribe({
      next: res => {
        Swal.fire({
          title: 'Success!',
          text: 'Branch saved successfully!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        this.route.navigate(['/admin/branch-list']);
      },
      error: err => {
        console.log("Error saving branch", err);
        Swal.fire({
          title: 'Error',
          text: `Error: ${err.message || err}`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  updateBranch(id: number) {
    this.api.updateTnx({ ...this.getPayload(), id }, this.endpoint).subscribe({
      next: res => {
        Swal.fire({
          title: 'Success!',
          text: 'Branch updated successfully!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        this.route.navigate(['/admin/create-branch', id]);
      },
      error: err => console.log("Error updating branch", err)
    });
  }

  setBranchStatus(status: string, id: number) {
    this.api.setTnxByStatus(status, id).subscribe({
      next: () => {
        Swal.fire({
          title: 'Success!',
          text: `Branch status updated to ${status}!`,
          icon: 'success',
          confirmButtonText: 'OK'
        });
        this.loadBranchDraft(); // reload updated data
      },
      error: err => console.log("Error updating branch status", err)
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }
  back() {
    this.location.back();
  }
}
