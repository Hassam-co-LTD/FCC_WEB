import { Component, ElementRef, Input } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-narrative-details',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule
],
  templateUrl: './narrative-details.html',
  styleUrls: ['./narrative-details.scss']
})
export class NarrativeDetails {
  @Input() form!: FormGroup;
  isOpen = true;
  activeTabIndex = 0;
  constructor() {
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  onTabChange(index: number) {
    this.activeTabIndex = index;
  }
}
