import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
})
export class PreviewSectionComponent implements OnInit {

  @Input() form!: FormGroup; // receive the reactive form
  @Input() uploadedFiles: any[] = []; // files
  @Input() documents: any[] = []; // document list

  constructor() {}

  ngOnInit(): void {}

  // helper to format checkbox yes/no
  formatCheckbox(value: boolean) {
    return value ? 'Yes' : 'No';
  }

}
