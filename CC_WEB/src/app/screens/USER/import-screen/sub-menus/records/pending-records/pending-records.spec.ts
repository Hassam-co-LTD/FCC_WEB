import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingRecords } from './pending-records';

describe('PendingRecords', () => {
  let component: PendingRecords;
  let fixture: ComponentFixture<PendingRecords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingRecords]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingRecords);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
