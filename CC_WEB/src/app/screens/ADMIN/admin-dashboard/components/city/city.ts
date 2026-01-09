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
  selector: 'app-city-master',
  templateUrl: './city.html',
  styleUrls: ['./city.scss'],
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
export class City implements OnInit {

  cityForm!: FormGroup;
  isOpen = true;
  storeCity: any;

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
    this.cityForm = this.fb.group({
      id: [null],
      cityName: ['', Validators.required],
      state: [''],
      country: ['']
    });

    // Subscribe to route parameter changes to load city dynamically
    this.activateRouter.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) this.getCityById(id);
      else this.storeCity = null; // clear for new city creation
    });
  }

  // =========================
  // UI HELPERS
  // =========================
  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  isReadOnly(): boolean {
    return this.storeCity?.cityStatus === 'A';
  }

  back(): void {
    this.location.back();
  }

  cancel(): void {
    this.cityForm.reset();
    this.storeCity = null;
  }

  // =========================
  // CRUD
  // =========================
  save(): void {
    this.api.setCity(this.cityForm.value).subscribe({
      next: res => {
        this.storeCity = res;
        Swal.fire({
          title: 'Success!',
          text: 'Your form was saved!',
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: { popup: 'swal2-top-left' }
        });
        this.route.navigate(["/admin/city-list"])
      },
      error: err => console.log('Error saving city', err)
    });
  }

  update(): void {
    if (!this.storeCity?.id) return;

    this.api.updateCity(this.cityForm.value).subscribe({
      next: res => {
        this.storeCity = res;
        Swal.fire({
          title: 'Updated!',
          text: 'Your form was Updated!',
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: { popup: 'swal2-top-left' }
        });
      },
      error: err => console.log('Error updating city', err)
    });
  }

  // =========================
  // FETCH CITY BY ID
  // =========================
  getCityById(id: number): void {
    this.api.getCityById(id).subscribe({
      next: res => {
        this.storeCity = res;
        this.cityForm.patchValue(res);
      },
      error: err => console.log('Error fetching city:', err)
    });
  }

  // =========================
  // STATUS ACTIONS
  // =========================
  submit(): void {
    if (!this.storeCity?.id) return;

    this.api.setCityByStatus('S', this.storeCity.id).subscribe({
      next: () => {
        Swal.fire({
          title: 'Submitted!',
          text: 'Your form was Submitted!',
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: { popup: 'swal2-top-left' }
        });
        this.route.navigate(['/admin/city-list'], {
          queryParams: { tabName: 'Submitted' }
        });
      },
      error: err => console.log('Error submitting city:', err)
    });
  }

  approve(id: number): void {
    this.api.setCityByStatus('A', id).subscribe({
      next: res => {
        this.storeCity = res;
        Swal.fire({
          title: 'Approved!',
          text: 'Your form was Approved!',
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: { popup: 'swal2-top-left' }
        });
        this.route.navigate(['/admin/city-list'], {
          queryParams: { tabName: 'Approved' }
        });
      },
      error: err => console.log('Error approving city:', err)
    });
  }

  reject(id: number): void {
    this.api.setCityByStatus('D', id).subscribe({
      next: () => {
        Swal.fire({
          title: 'Rejected!',
          text: 'The city was rejected.',
          icon: 'info',
          confirmButtonText: 'OK'
        });
        this.route.navigate(['/admin/city-list']);
      },
      error: err => console.log('Error rejecting city:', err)
    });
  }

  editApprovedCity(id: number): void {
    this.api.setCityByStatus('D', id).subscribe({
      next: () => {
        Swal.fire({
          title: 'Amended!',
          text: 'The approved city can now be edited.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        this.route.navigate(['/admin/city-list']);
      },
      error: err => console.log('Error amending approved city:', err)
    });
  }
}
