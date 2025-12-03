import { ComponentFixture, TestBed } from '@angular/core/testing';
import { } from '@angular/common';
import { ExportScreen } from './export-screen';
import { } from '@angular/forms';
import { } from '@angular/router';
import { } from '@angular/platform-browser';
import { } from '@angular/platform-browser/animations';
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
