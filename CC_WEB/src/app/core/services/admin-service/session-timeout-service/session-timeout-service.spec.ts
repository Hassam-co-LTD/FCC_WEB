import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionTimeoutService } from './session-timeout-service';

describe('SessionTimeoutService', () => {
  let component: SessionTimeoutService;
  let fixture: ComponentFixture<SessionTimeoutService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionTimeoutService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionTimeoutService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
