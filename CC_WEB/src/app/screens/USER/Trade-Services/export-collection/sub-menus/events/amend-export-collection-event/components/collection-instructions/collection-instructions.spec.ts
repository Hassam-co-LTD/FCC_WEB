import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionInstructions } from './collection-instructions';

describe('CollectionInstructions', () => {
  let component: CollectionInstructions;
  let fixture: ComponentFixture<CollectionInstructions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionInstructions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectionInstructions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
