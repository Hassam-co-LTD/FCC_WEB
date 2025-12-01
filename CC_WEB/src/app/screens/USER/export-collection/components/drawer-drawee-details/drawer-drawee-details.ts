import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-drawer-drawee-details',
  standalone: true,
  templateUrl: './drawer-drawee-details.html',
  styleUrls: ['./drawer-drawee-details.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class DrawerDraweeDetails {
  isOpen = true;
  activeSection: string | null = 'drawer';

  @Input() form!: FormGroup;

  constructor(private fb: FormBuilder) {

    this.form = this.fb.group({

      // Drawer fields
      drawerName: ['', Validators.required],
      drawerAddress1: ['', Validators.required],
      drawerAddress2: [''],

      // Drawee fields
      draweeName: ['', Validators.required],
      draweeAddress1: ['', Validators.required],
      draweeAddress2: ['']
    });
  }

  toggle(){
    this.isOpen = !this.isOpen;
  }
}
