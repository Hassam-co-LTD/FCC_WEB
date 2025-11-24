import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportScreen } from './export-screen';

describe('ExportScreen', () => {
  let component: ExportScreen;
  let fixture: ComponentFixture<ExportScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportScreen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
