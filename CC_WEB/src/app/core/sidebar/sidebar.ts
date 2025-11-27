import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Input, Output, EventEmitter, AfterViewInit, ElementRef, QueryList, ViewChildren, OnChanges, SimpleChanges, Inject, PLATFORM_ID } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class Sidebar {
  currentStep = 0;

  steps = [
    { label: "General Details" },
    { label: "Applicant Details" },
    { label: "Bank Details" },
    { label: "Amount & Charges" },
    { label: "Payment Details" },
    {label: "Undertaking Details"},
    { label: "Shipment Details" },
    { label: "Narrative Details" },
    { label: "Licenses" },
    { label: "Instructions to Bank" },
    { label: "Attachments" },
    { label: "Preview" }
  ];
  stepChange: any;
  collapsed: any;
  stepItems: any;

  ngAfterViewInit() {
    this.scrollActiveIntoView();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentStep']) {
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.scrollActiveIntoView(), 50);
      }
    }
  }
  platformId(platformId: any) {
    throw new Error('Method not implemented.');
  }

  scrollTo(i: number) {
    this.stepChange.emit(i);
  }

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  isCollapsed(): boolean {
    return this.collapsed;
  }

  /** 🔥 AUTO SCROLL ACTIVE ITEM INTO VIEW (Browser only) */
  private scrollActiveIntoView() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.stepItems) return;

    const item = this.stepItems.toArray()[this.currentStep];
    if (item?.nativeElement?.scrollIntoView) {
      item.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }
}
