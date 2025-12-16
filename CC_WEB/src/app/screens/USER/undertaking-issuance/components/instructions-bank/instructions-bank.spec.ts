import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructionsBank } from './instructions-bank';

describe('InstructionsBank', () => {
  let component: InstructionsBank;
  let fixture: ComponentFixture<InstructionsBank>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructionsBank]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructionsBank);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
