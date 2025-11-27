import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatIcon } from "@angular/material/icon";
@Component({
  selector: 'app-preview',
  imports: [
    CommonModule,
    MatIcon
],
  templateUrl: './preview.html',
  styleUrl: './preview.scss',
})
export class Preview {
  isOpen = true;
  toggle() {
    this.isOpen = !this.isOpen;
  }
  @Input() form!: FormGroup;
}
