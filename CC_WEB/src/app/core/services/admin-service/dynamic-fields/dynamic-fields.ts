import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dynamic-fields',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './dynamic-fields.html',
  styleUrl: './dynamic-fields.scss'
})
export class DynamicFields {

  @Input() fields: any[] = [];

  @Input() form!: FormGroup;

  @Input() isOpen = true;

  toggleDynamicFields(): void {
    this.isOpen = !this.isOpen;
  }
}