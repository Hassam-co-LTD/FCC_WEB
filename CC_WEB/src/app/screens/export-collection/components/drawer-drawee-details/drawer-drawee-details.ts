import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-drawer-drawee-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './drawer-drawee-details.html',
  styleUrls: ['./drawer-drawee-details.scss'],
})
export class DrawerDraweeDetails {

  /** Active Accordion Section */
  activeSection: string | null = 'drawer';

  /** Form Group */
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      // Drawer
      drawerName: ['', Validators.required],
      drawerAddress1: ['', Validators.required],
      drawerAddress2: [''],

      // Drawee
      draweeName: ['', Validators.required],
      draweeAddress1: ['', Validators.required],
      draweeAddress2: ['']
    });
  }

  /** Toggle Accordion Section */
  toggleSection(section: string) {
    this.activeSection = this.activeSection === section ? null : section;
  }
}
