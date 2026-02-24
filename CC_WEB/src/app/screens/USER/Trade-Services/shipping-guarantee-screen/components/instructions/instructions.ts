import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
@Component({
  selector: 'app-instructions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
],
  templateUrl: './instructions.html',
  styleUrls: ['./instructions.scss'],
})
export class InstructionsComponent {

  isOpen = true;
  @Input() form!: FormGroup;

  // Dropdown lists
  principalAccounts = ['Account 1', 'Account 2', 'Account 3'];
 
  toggle() {
    this.isOpen = !this.isOpen;
  }
}
