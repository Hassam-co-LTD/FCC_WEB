import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestUndertaking } from './request-undertaking';

describe('RequestUndertaking', () => {
  let component: RequestUndertaking;
  let fixture: ComponentFixture<RequestUndertaking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestUndertaking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestUndertaking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
