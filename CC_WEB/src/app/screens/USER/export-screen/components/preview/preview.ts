import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss']
})
export class Preview {
  isOpen = true;

  @Input() generalDetails: any;
  @Input() mtFile: File | null = null;
  @Input() attachments: File[] = [];

  toggle() {
    this.isOpen = !this.isOpen;
  }

  submit() {
    alert('Letter of Credit exported successfully!');
  }
}
