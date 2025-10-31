import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportScreen } from './import-screen';

describe('ImportScreen', () => {
  let component: ImportScreen;
  let fixture: ComponentFixture<ImportScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportScreen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
