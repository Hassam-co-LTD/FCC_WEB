import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-drawer-drawee-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './drawer-drawee-details.html',
  styleUrls: ['./drawer-drawee-details.scss']
})
export class DrawerDraweeDetails implements OnInit {

  @Input() form!: FormGroup;
  isOpen = true;

  ngOnInit(): void {
    // Do NOT recreate form here — use the form from parent
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
