import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportCollectionComponent } from './export-collection';

describe('ExportCollection', () => {
  let component: ExportCollectionComponent;
  let fixture: ComponentFixture<ExportCollectionComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportCollectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
