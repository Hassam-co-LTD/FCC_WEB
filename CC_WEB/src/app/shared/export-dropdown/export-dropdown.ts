import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type ExportFormat = 'excel' | 'pdf';

@Component({
  selector: 'app-export-dropdown',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './export-dropdown.html',
  styleUrl: './export-dropdown.scss',
})
export class ExportDropdown {
  @Input() disabled = false;

  @Input() label = 'Download Report';

  @Input() showExcel = true;

  @Input() showPdf = true;

  @Output() exportSelected =
    new EventEmitter<ExportFormat>();

  isOpen = false;

  toggleDropdown(): void {
    if (this.disabled) {
      return;
    }

    this.isOpen = !this.isOpen;
  }

  selectFormat(format: ExportFormat): void {
    if (this.disabled) {
      return;
    }

    this.isOpen = false;

    this.exportSelected.emit(format);
  }

  closeDropdown(): void {
    this.isOpen = false;
  }
}

