import { Component, Input, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-license',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './license.html',
  styleUrls: ['./license.scss'],
})
export class License {
  activeSection = 'license';

  /** Form Group */
  @Input() form: FormGroup;
  /** License Types */
  licenseTypes: string[] = ['Type A', 'Type B', 'Type C'];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      licenseType: [''],
      licenseNumber: ['']
    });
  }

  /** Toggle Accordion Section */
  toggleSection(key: string) {
    this.activeSection = this.activeSection === key ? '' : key;
  }
}
