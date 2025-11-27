import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Licenses } from './licenses';

describe('Licenses', () => {
  let component: Licenses;
  let fixture: ComponentFixture<Licenses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Licenses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Licenses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
