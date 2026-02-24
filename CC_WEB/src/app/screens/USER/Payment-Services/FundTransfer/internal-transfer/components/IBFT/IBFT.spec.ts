import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IBFT } from './IBFT';

describe('IBFT', () => {
  let component: IBFT;
  let fixture: ComponentFixture<IBFT>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IBFT]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IBFT);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
