import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiddleOffice } from './middle-office';

describe('MiddleOffice', () => {
  let component: MiddleOffice;
  let fixture: ComponentFixture<MiddleOffice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiddleOffice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiddleOffice);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
