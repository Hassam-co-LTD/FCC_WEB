import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListGenerateFields } from './list-generate-fields';

describe('ListGenerateFields', () => {
  let component: ListGenerateFields;
  let fixture: ComponentFixture<ListGenerateFields>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListGenerateFields]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListGenerateFields);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
