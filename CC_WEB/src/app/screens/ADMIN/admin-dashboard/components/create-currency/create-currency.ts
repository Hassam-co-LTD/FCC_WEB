import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';

import { ApiService } from '../../../../../core/services/api.service';

@Component({
  selector: 'app-Tnx-master',
  templateUrl: './create-currency.html',
  styleUrls: ['./create-currency.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule
  ]
})
export class CreateCurrency implements OnInit {

  TnxForm!: FormGroup;
  isOpen = true;
  storeTnx: any;
  apiName: String = "currency"
  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private location: Location,
    private activateRouter: ActivatedRoute,
    private route: Router
  ) {}

  // =========================
  // INIT
  // =========================
  ngOnInit(): void {
    this.TnxForm = this.fb.group({
      id: [null],
      TnxName: ['', Validators.required],
      state: [''],
      country: ['']
    });

    // Subscribe to route parameter changes to load Tnx dynamically
    this.activateRouter.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) this.getTnxById(id);
      else this.storeTnx = null; // clear for new Tnx creation
    });
  }

  // =========================
  // UI HELPERS
  // =========================
  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  isReadOnly(): boolean {
    return this.storeTnx?.TnxStatus === 'A';
  }

  back(): void {
    this.location.back();
  }

  cancel(): void {
    this.TnxForm.reset();
    this.storeTnx = null;
  }

  // =========================
  // CRUD
  // =========================
  save(): void {
    this.api.saveTnx(this.TnxForm.value,this.apiName).subscribe({
      next: res => {
        this.storeTnx = res;
        Swal.fire({
          title: 'Success!',
          text: 'Your form was saved!',
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: { popup: 'swal2-top-left' }
        });
        this.route.navigate(["/admin/Tnx-list"])
      },
      error: err => console.log('Error saving Tnx', err)
    });
  }

  update(): void {
    if (!this.storeTnx?.id) return;

    this.api.updateTnx(this.TnxForm.value,this.apiName).subscribe({
      next: res => {
        this.storeTnx = res;
        Swal.fire({
          title: 'Updated!',
          text: 'Your form was Updated!',
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: { popup: 'swal2-top-left' }
        });
      },
      error: err => console.log('Error updating Tnx', err)
    });
  }

  // =========================
  // FETCH Tnx BY ID
  // =========================
  getTnxById(id: number): void {
    this.api.getCityById(id).subscribe({
      next: res => {
        this.storeTnx = res;
        this.TnxForm.patchValue(res);
      },
      error: err => console.log('Error fetching Tnx:', err)
    });
  }

  // =========================
  // STATUS ACTIONS
  // =========================
  submit(): void {
    if (!this.storeTnx?.id) return;

    this.api.setTnxByStatus('S', this.storeTnx.id).subscribe({
      next: () => {
        Swal.fire({
          title: 'Submitted!',
          text: 'Your form was Submitted!',
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: { popup: 'swal2-top-left' }
        });
        this.route.navigate(['/admin/Tnx-list'], {
          queryParams: { tabName: 'Submitted' }
        });
      },
      error: err => console.log('Error submitting Tnx:', err)
    });
  }

  approve(id: number): void {
    this.api.setTnxByStatus('A', id).subscribe({
      next: res => {
        this.storeTnx = res;
        Swal.fire({
          title: 'Approved!',
          text: 'Your form was Approved!',
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: { popup: 'swal2-top-left' }
        });
        this.route.navigate(['/admin/Tnx-list'], {
          queryParams: { tabName: 'Approved' }
        });
      },
      error: err => console.log('Error approving Tnx:', err)
    });
  }

  reject(id: number): void {
    this.api.setTnxByStatus('D', id).subscribe({
      next: () => {
        Swal.fire({
          title: 'Rejected!',
          text: 'The Tnx was rejected.',
          icon: 'info',
          confirmButtonText: 'OK'
        });
        this.route.navigate(['/admin/Tnx-list']);
      },
      error: err => console.log('Error rejecting Tnx:', err)
    });
  }

  editApprovedTnx(id: number): void {
    this.api.setTnxByStatus('D', id).subscribe({
      next: () => {
        Swal.fire({
          title: 'Amended!',
          text: 'The approved Tnx can now be edited.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        this.route.navigate(['/admin/Tnx-list']);
      },
      error: err => console.log('Error amending approved Tnx:', err)
    });
  }
}
