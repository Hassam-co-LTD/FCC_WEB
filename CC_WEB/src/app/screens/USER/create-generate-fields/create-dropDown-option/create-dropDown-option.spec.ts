import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDynamicFieldOptions } from './create-dropDown-option';

describe('CreateDynamicFieldOptions', () => {
  let component: CreateDynamicFieldOptions;
  let fixture: ComponentFixture<CreateDynamicFieldOptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDynamicFieldOptions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDynamicFieldOptions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
