import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThirdPartyTransfer } from './third-party-transfer';

describe('ThirdPartyTransfer', () => {
  let component: ThirdPartyTransfer;
  let fixture: ComponentFixture<ThirdPartyTransfer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThirdPartyTransfer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThirdPartyTransfer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
