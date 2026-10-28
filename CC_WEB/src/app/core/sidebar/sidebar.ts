import { isPlatformBrowser } from '@angular/common';
import { Component, Input, Output, EventEmitter, AfterViewInit, ElementRef, QueryList, ViewChildren, OnChanges, OnDestroy, SimpleChanges, Inject, PLATFORM_ID } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class Sidebar implements AfterViewInit, OnChanges, OnDestroy {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  collapsed = false;

  /** Step highlighted in the list. Follows the scroll position once the scroll spy is attached. */
  activeStep = 0;

  /** Fallback used until (or unless) the page's `.scroll-area` is found. */
  @Input() currentStep = 0;
  @Input() steps: { label: string }[] = [];

  @Output() stepChange = new EventEmitter<number>();

  @ViewChildren('stepItem') stepItems!: QueryList<ElementRef>;

  private scrollArea: HTMLElement | null = null;
  private readonly onScroll = () => this.updateActiveStep();

  ngAfterViewInit() {
    this.scrollActiveIntoView();
    if (isPlatformBrowser(this.platformId)) {
      // wait for the host page to render its sections
      setTimeout(() => this.attachScrollSpy(), 250);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentStep'] && !this.scrollArea) {
      this.activeStep = this.currentStep;
    }
    if (changes['currentStep'] || changes['steps']) {
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.scrollActiveIntoView(), 50);
      }
    }
  }

  ngOnDestroy() {
    this.scrollArea?.removeEventListener('scroll', this.onScroll);
  }

  scrollTo(i: number) {
    this.activeStep = i;
    this.stepChange.emit(i);
  }

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  isCollapsed(): boolean {
    return this.collapsed;
  }

  private attachScrollSpy() {
    const area = document.querySelector('.scroll-area') as HTMLElement | null;
    if (!area) return;

    this.scrollArea = area;
    area.addEventListener('scroll', this.onScroll, { passive: true });
    this.updateActiveStep();
  }

  /**
   * Position-based scroll spy over the page's `section-<n>` blocks, where n is the step index.
   * Unlike a visibility-ratio observer it works for sections taller than the viewport, and
   * it picks the last section once scrolled to the bottom, since a short final section
   * (e.g. Dynamic fields) can never reach the top of the container.
   */
  private updateActiveStep() {
    const area = this.scrollArea;
    if (!area) return;

    const sections = Array.from(
      area.querySelectorAll<HTMLElement>('section[id^="section-"]'),
    )
      .map((el) => ({ el, index: /^section-(\d+)$/.exec(el.id)?.[1] }))
      .filter((s) => s.index !== undefined && s.el.getClientRects().length > 0)
      .map((s) => ({ el: s.el, index: Number(s.index) }));

    if (sections.length === 0) return;

    let active = sections[0].index;

    const scrolls = area.scrollHeight > area.clientHeight;
    const atBottom = area.scrollTop + area.clientHeight >= area.scrollHeight - 2;

    if (scrolls && atBottom) {
      active = sections[sections.length - 1].index;
    } else {
      const line = area.getBoundingClientRect().top + 60;
      for (const { el, index } of sections) {
        if (el.getBoundingClientRect().top <= line) {
          active = index;
        }
      }
    }

    if (active !== this.activeStep) {
      this.activeStep = active;
      this.scrollActiveIntoView();
    }
  }

  /** AUTO SCROLL ACTIVE ITEM INTO VIEW (Browser only) */
  private scrollActiveIntoView() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.stepItems) return;

    const item = this.stepItems.toArray()[this.activeStep];
    if (item?.nativeElement?.scrollIntoView) {
      item.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }
}
