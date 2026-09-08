import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionsGroupsInquiry } from './permissions-groups-inquiry';

describe('PermissionsGroupsInquiry', () => {
  let component: PermissionsGroupsInquiry;
  let fixture: ComponentFixture<PermissionsGroupsInquiry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionsGroupsInquiry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionsGroupsInquiry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
