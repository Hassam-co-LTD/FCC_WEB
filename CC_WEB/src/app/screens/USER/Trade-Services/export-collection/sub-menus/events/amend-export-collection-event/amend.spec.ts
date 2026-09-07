import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Amend } from './amend';

describe('Amend', () => {
  let component: Amend;
  let fixture: ComponentFixture<Amend>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Amend]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Amend);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
