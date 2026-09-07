import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportDropdown } from './export-dropdown';

describe('ExportDropdown', () => {
  let component: ExportDropdown;
  let fixture: ComponentFixture<ExportDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportDropdown]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportDropdown);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
