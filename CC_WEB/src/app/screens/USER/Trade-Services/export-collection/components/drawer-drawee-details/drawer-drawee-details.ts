import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-drawer-drawee-details',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
],
  templateUrl: './drawer-drawee-details.html',
  styleUrls: ['./drawer-drawee-details.scss']
})
export class DrawerDraweeDetails {

  @Input() form!: FormGroup;
  isOpen = true;

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
