import { ComponentFixture, TestBed } from '@angular/core/testing';
import { } from '@angular/common';
import { ExportScreenComponent } from './export-screen';
import { } from '@angular/forms';
import { } from '@angular/router';
import { } from '@angular/platform-browser';
import { } from '@angular/platform-browser/animations';
describe('ExportScreen', () => {
  let component: ExportScreenComponent;
  let fixture: ComponentFixture<ExportScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportScreenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
