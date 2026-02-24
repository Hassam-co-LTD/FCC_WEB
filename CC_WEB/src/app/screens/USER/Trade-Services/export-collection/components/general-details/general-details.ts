import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-general-details',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
],
  templateUrl: './general-details.html',
  styleUrls: ['./general-details.scss']
})
export class GeneralDetails {
  
  @Input() form!: FormGroup;
  isOpen = true;
  toggle() {
    this.isOpen = !this.isOpen;
  }
}
