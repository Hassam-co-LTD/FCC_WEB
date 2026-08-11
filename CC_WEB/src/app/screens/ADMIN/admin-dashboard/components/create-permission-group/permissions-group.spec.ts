import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionGroup } from './permissions-group';

describe('PermissionGroup', () => {
  let component: PermissionGroup;
  let fixture: ComponentFixture<PermissionGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
