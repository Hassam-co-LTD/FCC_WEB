import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancingRequest } from './financing-request';

describe('FinancingRequest', () => {
  let component: FinancingRequest;
  let fixture: ComponentFixture<FinancingRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancingRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancingRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
