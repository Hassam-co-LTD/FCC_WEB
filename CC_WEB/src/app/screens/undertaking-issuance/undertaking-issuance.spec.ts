import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UndertakingIssuance } from './undertaking-issuance';

describe('UndertakingIssuance', () => {
  let component: UndertakingIssuance;
  let fixture: ComponentFixture<UndertakingIssuance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UndertakingIssuance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UndertakingIssuance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
