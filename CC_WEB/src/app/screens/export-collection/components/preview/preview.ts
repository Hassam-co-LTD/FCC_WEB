import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-preview-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
})
export class PreviewSectionComponent {

  @Input() ecForm: FormGroup = new FormGroup({});
  @Input() coverFileName: string | null = null;
  @Input() uploadedFiles: File[] = [];

  activeSection: string = 'preview';

  toggleSection(key: string) {
    this.activeSection = this.activeSection === key ? '' : key;
  }
}
