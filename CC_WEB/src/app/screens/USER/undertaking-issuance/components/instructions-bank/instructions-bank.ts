import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { MatSelect, MatOption, MatSelectModule } from "@angular/material/select";
import { MatRadioButton, MatRadioGroup, MatRadioModule } from "@angular/material/radio";
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-instructions-bank',
  templateUrl: './instructions-bank.html',
  styleUrls: ['./instructions-bank.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatIconModule,
  ]
})
export class InstructionsBank implements OnInit {
  @Input() form!: FormGroup;
  isOpen = true;

  // FormGroup for reactive form
  
  // Sample accounts array
  accounts: string[] = ['Account 1', 'Account 2', 'Account 3'];
  
  instructionsForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.instructionsForm = this.fb.group({
      deliveryType: [''],
      deliveryMode: [''],
      deliveryTo: [''],
      principalAccount: [''],
      feeAccount: [''],
      otherInstructions: ['']
    });
  }


  toggle() {
    this.isOpen = !this.isOpen;
  }

  // Optional: getter for easier access in template
  get f() {
    return this.instructionsForm.controls;
  }
}