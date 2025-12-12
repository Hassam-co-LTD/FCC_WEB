import { isPlatformBrowser } from '@angular/common';
import { Component, Input, Output, EventEmitter, AfterViewInit, ElementRef, QueryList, ViewChildren, OnChanges, SimpleChanges, Inject, PLATFORM_ID } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class Sidebar implements AfterViewInit, OnChanges {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  collapsed = false;

  @Input() currentStep = 0;
  @Input() steps: { label: string }[] = [];

  @Output() stepChange = new EventEmitter<number>();

  @ViewChildren('stepItem') stepItems!: QueryList<ElementRef>;

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
