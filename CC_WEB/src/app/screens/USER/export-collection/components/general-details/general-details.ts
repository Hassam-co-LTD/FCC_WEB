import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-general-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './general-details.html',
  styleUrls: ['./general-details.scss']
})
export class GeneralDetails implements OnInit {
  isOpen = true;
  preview: any = {};
 @Input() form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      collectionType: [''],
      customerReference: [''],
      draweeReference: ['']
    });
  }
  

  toggle() {
    this.isOpen = !this.isOpen;
  }
  
}
