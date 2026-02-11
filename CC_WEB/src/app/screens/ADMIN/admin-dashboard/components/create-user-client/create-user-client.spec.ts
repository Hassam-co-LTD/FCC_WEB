import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateClientUser } from './create-user-client';

describe('CreateClientUser', () => {
  let component: CreateClientUser;
  let fixture: ComponentFixture<CreateClientUser>;    
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateClientUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateClientUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
