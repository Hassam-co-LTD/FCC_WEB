import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportCollection} from './export-collection';

describe('ExportCollection', () => {
  let component: ExportCollection;
  let fixture: ComponentFixture<ExportCollection>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportCollection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportCollection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
