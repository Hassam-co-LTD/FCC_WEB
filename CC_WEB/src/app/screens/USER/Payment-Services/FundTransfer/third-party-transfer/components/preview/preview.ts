import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './preview.html',
  styleUrl: './preview.scss'
})
export class Preview {
  @Input() form!: FormGroup;

  /**
   * Safe getter for form values to be used in the preview template.
   */
  getVal(controlName: string): any {
    if (!this.form || !this.form.get(controlName)) {
      return '';
    }
    return this.form.get(controlName)?.value;
  }
}