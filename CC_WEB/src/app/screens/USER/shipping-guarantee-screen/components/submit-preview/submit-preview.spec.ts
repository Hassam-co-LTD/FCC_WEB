import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitPreview } from './submit-preview';

describe('SubmitPreview', () => {
  let component: SubmitPreview;
  let fixture: ComponentFixture<SubmitPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitPreview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
