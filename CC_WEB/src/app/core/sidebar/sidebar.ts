import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Input, Output, EventEmitter, AfterViewInit, ElementRef, QueryList, ViewChildren, Inject, PLATFORM_ID } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class Sidebar implements AfterViewInit {

  @Input() steps: any[] = [];
  @Input() currentStep: number = 0;
  @Output() stepChange = new EventEmitter<number>();

  @ViewChildren('stepItem') stepItems!: QueryList<ElementRef>;
  collapsed: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    this.scrollActiveIntoView();
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
