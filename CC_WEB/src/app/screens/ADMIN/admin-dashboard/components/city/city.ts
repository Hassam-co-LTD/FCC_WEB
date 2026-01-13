import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import Swal from 'sweetalert2';
import { ApiService } from '../../../../../core/services/api.service';


// =========================
// MODELS & ENUMS
// =========================
export enum CityStatus {
  Draft = 'D',
  Submitted = 'S',
  Approved = 'A'
}

export interface City {
  id: number;
  cityName: string;
  state: string;
  country: string;
  cityStatus: CityStatus;
}

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
  storeCity = {} as City;
 CityStatus = CityStatus;

  readonly apiName: string = 'city';

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  // =========================
  // INIT
  // =========================
  ngOnInit(): void {
    this.initForm();

    this.activatedRoute.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.getCityById(id);
      } else {
        // this.storeCity = null;
        this.cityForm.enable();
      }
    });
  }

  private initForm(): void {
    this.cityForm = this.fb.group({
      id: [null],
      cityName: ['', Validators.required],
      state: [''],
      country: ['']
    });
  }

  // =========================
  // UI HELPERS
  // =========================
  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  isReadOnly(): boolean {
    return this.storeCity?.cityStatus === CityStatus.Approved;
  }

  back(): void {
    this.location.back();
  }

  cancel(): void {
    if (this.storeCity) {
      this.cityForm.patchValue(this.storeCity);
    } else {
      this.cityForm.reset();
    }
  }

  // =========================
  // CRUD
  // =========================
  save(): void {
    if (this.cityForm.invalid) return;

    this.api.saveTnx(this.cityForm.value, this.apiName).subscribe({
      next: res => {
        this.storeCity = res;
        this.handleSuccess('Your form was saved!');
        this.router.navigate(['/admin/city-list']);
      },
      error: err => console.error('Error saving city', err)
    });
  }

  update(): void {
    if (!this.storeCity?.id || this.cityForm.invalid) return;

    this.api.updateTnx(this.cityForm.value, this.apiName).subscribe({
      next: res => {
        this.storeCity = res;
        this.handleSuccess('Your form was updated!', false);
      },
      error: err => console.error('Error updating city', err)
    });
  }

  // =========================
  // FETCH
  // =========================
  private getCityById(id: number): void {
    this.api.getCityById(id).subscribe({
      next: (res: City) => {
        this.storeCity = res;
        this.cityForm.patchValue(res);

        if (res.cityStatus === CityStatus.Approved) {
          this.cityForm.disable();
        } else {
          this.cityForm.enable();
        }
      },
      error: err => console.error('Error fetching city:', err)
    });
  }

  // =========================
  // STATUS ACTIONS
  // =========================
  submit(): void {
    if (!this.storeCity?.id) return;

    this.updateStatus(CityStatus.Submitted, 'Submitted!', 'Your form was submitted!', 'Submitted');
  }

  approve(id: number): void {
    this.updateStatus(CityStatus.Approved, 'Approved!', 'Your form was approved!', 'Approved', id);
  }

  reject(id: number): void {
    this.updateStatus(CityStatus.Draft, 'Rejected!', 'The city was rejected.');
  }

  editApprovedCity(id: number): void {
    Swal.fire({
      title: 'Amend Approved City?',
      text: 'This will move the city back to Draft for editing.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, amend'
    }).then(result => {
      if (result.isConfirmed) {
        this.api.setTnxByStatus(CityStatus.Draft, id).subscribe(() => {
          this.router.navigate(['/admin/city-list']);
        });
      }
    });
  }

  // =========================
  // HELPERS
  // =========================
  private updateStatus(
    status: CityStatus,
    title: string,
    message: string,
    tabName?: string,
    id?: number
  ): void {
    const cityId = id ?? this.storeCity?.id;
    if (!cityId) return;

    this.api.setTnxByStatus(status, cityId).subscribe({
      next: () => {
        Swal.fire({
          title,
          text: message,
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: { popup: 'swal2-top-left' }
        });

        this.router.navigate(['/admin/city-list'], {
          queryParams: tabName ? { tabName } : {}
        });
      },
      error: err => console.error('Status update error:', err)
    });
  }

  private handleSuccess(message: string, showNavigate = true): void {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: { popup: 'swal2-top-left' }
    });

    if (showNavigate) {
      this.router.navigate(['/admin/city-list']);
    }
  }
}
