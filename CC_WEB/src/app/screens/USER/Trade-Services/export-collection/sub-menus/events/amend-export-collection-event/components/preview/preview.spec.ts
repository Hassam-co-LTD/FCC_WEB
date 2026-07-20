import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewSectionComponent } from './preview';

describe('Preview', () => {
  let component: PreviewSectionComponent;
  let fixture: ComponentFixture<PreviewSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
