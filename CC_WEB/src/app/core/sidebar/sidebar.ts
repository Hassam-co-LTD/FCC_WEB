import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class Sidebar {
  collapsed = false;

  @Input() currentStep = 0;

  // Dynamic steps injected from parent
  @Input() steps: { label: string }[] = [];

  @Output() stepChange = new EventEmitter<number>();

  scrollTo(i: number) {
    this.stepChange.emit(i);
  }

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  isCollapsed(): boolean {
    return this.collapsed;
  }
}

// import { CommonModule } from '@angular/common';
// import { Component, ChangeDetectorRef, OnDestroy } from '@angular/core';
// import { MatButtonModule } from '@angular/material/button';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatInputModule } from '@angular/material/input';
// import { MatRadioModule } from '@angular/material/radio';
// import { MatSelectModule } from '@angular/material/select';
// import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// @Component({
//   selector: 'app-sidebar',
//   standalone: true,
//   imports: [
//     CommonModule,
//     MatButtonModule,
//     MatRadioModule,
//     MatSelectModule,
//     MatInputModule,
//     MatCheckboxModule,
//     MatSlideToggleModule,
//   ],
//   templateUrl: './sidebar.html',
//   styleUrls: ['./sidebar.scss'],
// })
// export class Sidebar implements OnDestroy {
//   currentStep = 0;

//   steps = [
//     { label: "General Details" },
//     { label: "Applicant Details" },
//     { label: "Bank Details" },
//     { label: "Amount & Charges" },
//     { label: "Payment Details" },
//     { label: "Shipment Details" },
//     { label: "Narrative Details" },
//     { label: "Licenses" },
//     { label: "Instructions to Bank" },
//     { label: "Attachments" },
//     { label: "Preview" }
//   ];

//   private observer?: IntersectionObserver;
//   private pollInterval: any;

//   constructor(private cdr: ChangeDetectorRef) { }

//   ngAfterViewInit() {
//     // Wait for the scroll-area to appear (handles asynchronous render order)
//     this.waitForScrollAreaAndInit();
//   }

//   ngOnDestroy() {
//     if (this.observer) {
//       this.observer.disconnect();
//     }
//     if (this.pollInterval) {
//       clearInterval(this.pollInterval);
//     }
//   }

//   private waitForScrollAreaAndInit() {
//     const maxAttempts = 60; // about 3 seconds if interval .05s
//     let attempts = 0;

//     this.pollInterval = setInterval(() => {
//       attempts++;
//       const scrollArea = document.querySelector('.scroll-area') as HTMLElement | null;
//       const sections = document.querySelectorAll('section');

//       if (scrollArea && sections.length > 0) {
//         clearInterval(this.pollInterval);
//         this.pollInterval = null;
//         this.initializeObserver(scrollArea, sections);
//       } else if (attempts >= maxAttempts) {
//         // fallback: try to initialize with viewport root (window)
//         clearInterval(this.pollInterval);
//         this.pollInterval = null;
//         const fallbackRoot: HTMLElement | null = null;
//         const fallbackSections = document.querySelectorAll('section');
//         if (fallbackSections.length > 0) {
//           this.initializeObserver(fallbackRoot, fallbackSections);
//         } else {
//           // nothing to observe — safe exit
//           console.warn('[Sidebar] no scroll-area or <section> elements found for observation.');
//         }
//       }
//     }, 50);
//   }

//   private initializeObserver(root: HTMLElement | null, sections: NodeListOf<Element>) {
//     // Clean up previous observer if any
//     if (this.observer) {
//       this.observer.disconnect();
//     }

//     // IntersectionObserver options tuned for stepper UX
//     const options: IntersectionObserverInit = {
//       root: root,                 // .scroll-area or null (viewport fallback)
//       rootMargin: '0px 0px -40% 0px', // treat an element as "entered" when top ~ 60% down
//       threshold: [0, 0.25, 0.5, 0.75, 1]
//     };

//     this.observer = new IntersectionObserver((entries) => {
//       // find which entry is most visible
//       let bestEntry: IntersectionObserverEntry | null = null;
//       let bestRatio = 0;
//       for (const entry of entries) {
//         if (entry.intersectionRatio > bestRatio) {
//           bestRatio = entry.intersectionRatio;
//           bestEntry = entry;
//         }
//       }
//       if (bestEntry && bestEntry.isIntersecting) {
//         const index = Array.from(sections).indexOf(bestEntry.target);
//         if (index >= 0 && index !== this.currentStep) {
//           this.currentStep = index;
//           // ensure change detection triggers
//           this.cdr.detectChanges();
//         }
//       }
//     }, options);

//     sections.forEach(section => this.observer!.observe(section));
//   }

//   scrollToSection(i: number) {
//     this.currentStep = i;
//     const section = document.getElementById(`section-${i}`);
//     if (section) {
//       // if page uses dedicated scroll container, scroll that container; otherwise scroll viewport
//       const scrollArea = document.querySelector('.scroll-area') as HTMLElement | null;
//       if (scrollArea) {
//         // compute position inside scrollArea
//         const scrollAreaRect = scrollArea.getBoundingClientRect();
//         const sectionRect = section.getBoundingClientRect();
//         const offset = sectionRect.top - scrollAreaRect.top + scrollArea.scrollTop;
//         // animate
//         scrollArea.scrollTo({ top: offset, behavior: 'smooth' });
//       } else {
//         section.scrollIntoView({ behavior: 'smooth', block: 'start' });
//       }
//     }
//   }

//   next() {
//     if (this.currentStep < this.steps.length - 1) {
//       this.scrollToSection(this.currentStep + 1);
//     }
//   }

//   previous() {
//     if (this.currentStep > 0) {
//       this.scrollToSection(this.currentStep - 1);
//     }
//   }
// }
