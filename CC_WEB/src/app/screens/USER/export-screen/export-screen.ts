import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeneralDetails } from '../../USER/export-screen/components/general-details/general-details';
import { Upload } from "./components/upload/upload";
import { Attachments } from "./components/attachments/attachments";
import { Preview } from "./components/preview/preview";
import { Sidebar } from '../../../core/sidebar/sidebar';

@Component({
  selector: 'app-export-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, GeneralDetails, Upload, Attachments, Preview,Sidebar],
  templateUrl: './export-screen.html',
  styleUrls: ['./export-screen.scss']
})
export class ExportScreen {
  currentStep = 0;

  exportlcSteps = [
    { label: 'General Details' },
    { label: 'Upload MT700/MT701' },
    { label: 'Attachments' },
    { label: 'Preview' }
  ];

  ngAfterViewInit() {
    setTimeout(() => {
      const sections = document.querySelectorAll('section');

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const index = Array.from(sections)
                .indexOf(entry.target as HTMLElement);
              this.currentStep = index;
            }
          }
        },
        {
          threshold: 0.4,
          root: document.querySelector('.scroll-area')
        }
      );

      sections.forEach(section => observer.observe(section));
    }, 200);
  }

  // Sidebar scroll
  scrollToSection(i: number) {
    this.currentStep = i;
    const section = document.getElementById(`section-${i}`);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Next section
  next() {
    if (this.currentStep < this.exportlcSteps.length - 1) {
      this.scrollToSection(this.currentStep + 1);
    }
  }

  // Previous section
  previous() {
    if (this.currentStep > 0) {
      this.scrollToSection(this.currentStep - 1);
    }
  }
}
