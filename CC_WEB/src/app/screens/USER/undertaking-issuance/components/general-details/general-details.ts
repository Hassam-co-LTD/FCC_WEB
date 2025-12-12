import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from "@angular/material/radio";

@Component({
  selector: 'app-general-details',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule
],
  templateUrl: './general-details.html',
  styleUrls: ['./general-details.scss']
})
export class generalDetails implements OnInit {
  
  @Input() form!: FormGroup;
  @Output() filesChange = new EventEmitter<File[]>();
  isOpen = true;

  ngOnInit(): void {
    // Do NOT recreate form here
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
