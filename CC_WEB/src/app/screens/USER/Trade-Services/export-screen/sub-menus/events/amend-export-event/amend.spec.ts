import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmendScreen } from './amend';

describe('Amend', () => {
  let component: AmendScreen;
  let fixture: ComponentFixture<AmendScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmendScreen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmendScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
