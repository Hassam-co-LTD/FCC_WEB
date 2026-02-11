import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleMasterList } from './role-master-list';

describe('RoleMasterList', () => {
  let component: RoleMasterList;
  let fixture: ComponentFixture<RoleMasterList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleMasterList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleMasterList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
