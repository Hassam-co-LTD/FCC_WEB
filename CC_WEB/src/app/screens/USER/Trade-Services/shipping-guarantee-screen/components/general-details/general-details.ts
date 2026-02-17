import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';   
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatOption } from '@angular/material/select';
@Component({
  selector: 'app-general-details',
  standalone: true,
  imports: [
   CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSelectModule,
    MatOption,
    MatButtonModule
],
  templateUrl: './general-details.html',
  styleUrls: ['./general-details.scss'],
})
export class GeneralDetails{

  isOpen = true;
  @Input() form!: FormGroup;

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
