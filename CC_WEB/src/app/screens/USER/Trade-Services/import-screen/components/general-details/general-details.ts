import { formatDate } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIcon } from "@angular/material/icon";
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-general-details',
  standalone: true,
  imports: [
    MatButtonModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatSelectModule,
    MatInputModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatIcon,
    MatDatepickerModule,
    MatNativeDateModule
],
  templateUrl: './general-details.html',
  styleUrl: './general-details.scss',
})
export class GeneralDetails {

  @Input() form!: FormGroup;

  isOpen = true;
  preview: any = {};

  // ngOnInit() {
  //   // Initialize preview
  //   this.updatePreview();

  //   // Update preview on form changes
  //   this.form.valueChanges.subscribe(() => {
  //     this.updatePreview();
  //   });
  // }

  // updatePreview() {
  //   const val = this.form.value;

  //   this.preview = {
  //     ...val,
  //     expiryDate: this.formatDateForPreview(val.expiryDate)
  //   };
  // }

  formatDateForPreview(date: string): string {
    if (!date) return '-';

    return formatDate(date, 'dd MMM yyyy', 'en-US');
    // Example: 2025-02-12 → "12 Feb 2025"
  }

  toggle() {
    this.isOpen = !this.isOpen;
    // if (!this.isOpen) this.updatePreview();
  }
}
