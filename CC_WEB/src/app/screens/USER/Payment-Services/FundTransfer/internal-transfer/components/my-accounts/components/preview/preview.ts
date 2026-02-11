import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';


@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss']
})
export class Preview {

  @Input() form!: FormGroup;

  /** Generic getter for preview values */
  getVal(path: string): any {
    return this.form?.get(path)?.value ?? '-';
  }

  formatAmount(): string {
    const amount = this.getVal('generalDetails.amount');
    return amount ? Number(amount).toLocaleString('en-PK', { minimumFractionDigits: 2 }) : '-';
  }

  formatDate(): string {
    const date = this.getVal('generalDetails.transferDate');
    return date ? new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }) : '-';
  }
}

