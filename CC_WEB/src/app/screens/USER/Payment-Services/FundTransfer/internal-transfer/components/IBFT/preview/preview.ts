import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss']
})
export class Preview {
  @Input() form!: FormGroup;

  // Function to safely get values from the nested 'generalDetails' group
  getVal(controlName: string): any {
    const group = this.form?.get('generalDetails') as FormGroup;
    if (group && group.get(controlName)) {
      return group.get(controlName)?.value;
    }
    return '---';
  }
}