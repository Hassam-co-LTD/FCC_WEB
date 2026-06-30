import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionsInquiry } from './permissions-inquiry';

describe('PermissionsInquiry', () => {
  let component: PermissionsInquiry;
  let fixture: ComponentFixture<PermissionsInquiry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionsInquiry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionsInquiry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
