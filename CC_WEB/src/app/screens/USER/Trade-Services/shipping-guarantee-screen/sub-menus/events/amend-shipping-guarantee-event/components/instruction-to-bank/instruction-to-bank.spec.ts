import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructionToBank } from './instruction-to-bank';

describe('InstructionToBank', () => {
  let component: InstructionToBank;
  let fixture: ComponentFixture<InstructionToBank>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructionToBank]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructionToBank);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
