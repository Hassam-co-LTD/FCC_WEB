import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListUserClient } from './list-user-client';

describe('ListUserClient', () => {
  let component: ListUserClient;
  let fixture: ComponentFixture<ListUserClient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListUserClient]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListUserClient);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
