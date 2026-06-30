import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionMaster } from './permission-master';

describe('PermissionMaster', () => {
  let component: PermissionMaster;
  let fixture: ComponentFixture<PermissionMaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionMaster]
    })
    .compileComponents();

    
    fixture = TestBed.createComponent(PermissionMaster);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
