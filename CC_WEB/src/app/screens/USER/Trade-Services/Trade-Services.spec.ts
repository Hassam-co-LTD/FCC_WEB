import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeServices } from './Trade-Services';

describe('TradeService', () => {
  let component: TradeServices;
  let fixture: ComponentFixture<TradeServices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradeServices]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TradeServices);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
