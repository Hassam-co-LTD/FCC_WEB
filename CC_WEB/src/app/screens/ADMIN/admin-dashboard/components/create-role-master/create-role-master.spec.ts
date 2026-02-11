import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRoleMaster } from './create-role-master';

describe('CreateRoleMaster', () => {
  let component: CreateRoleMaster;
  let fixture: ComponentFixture<CreateRoleMaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRoleMaster]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateRoleMaster);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
