import { ComponentFixture, TestBed } from '@angular/core/testing';

import { License } from './license';

describe('License', () => {
  let component: License;
  let fixture: ComponentFixture<License>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [License]
    })
    .compileComponents();

    fixture = TestBed.createComponent(License);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
