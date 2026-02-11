import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatOption, MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatLabel } from '@angular/material/form-field';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-general-details',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIcon,
    MatSelectModule,
    MatInputModule,
    MatLabel,
    DatePipe,
    // MatDatepicker,
    // MatDatepickerInput,
    // MatDatepickerToggle
  ],
  templateUrl: './general-details.html',
  styleUrls: ['./general-details.scss']
})
export class GeneralDetails {
  @Input({ required: true }) form!: FormGroup;
  isOpen = true;

  toggle(): void {
    this.isOpen = !this.isOpen;
  }
}
