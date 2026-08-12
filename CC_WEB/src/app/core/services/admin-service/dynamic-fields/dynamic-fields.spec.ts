import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicFields } from './dynamic-fields';

describe('DynamicFields', () => {
  let component: DynamicFields;
  let fixture: ComponentFixture<DynamicFields>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicFields]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicFields);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
