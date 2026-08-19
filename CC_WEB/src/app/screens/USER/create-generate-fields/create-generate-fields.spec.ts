import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGenerateFields } from './create-generate-fields';

describe('CreateGenerateFields', () => {
  let component: CreateGenerateFields;
  let fixture: ComponentFixture<CreateGenerateFields>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateGenerateFields]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateGenerateFields);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
