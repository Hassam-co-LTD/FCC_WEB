import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-general-details-undertaking',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatRadioModule,
    MatSelectModule,
    MatInputModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatIcon
  ],
  templateUrl: './general-details.html',
  styleUrl: './general-details.scss',
})
export class GeneralDetails {
  isOpen = true;
  currentStep = 0;
  steps = [
    { label: "General Details" },
    { label: "Shipment Details" },
    { label: "Documents Upload" }
  ];

  toggle() {
    this.isOpen = !this.isOpen;
  }


  selectStep(i: number) { this.currentStep = i; }
  next() { if (this.currentStep < this.steps.length - 1) this.currentStep++; }

}



