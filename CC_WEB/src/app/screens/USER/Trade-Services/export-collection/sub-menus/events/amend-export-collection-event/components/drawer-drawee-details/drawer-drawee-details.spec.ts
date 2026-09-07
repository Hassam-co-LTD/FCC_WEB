import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawerDraweeDetails } from './drawer-drawee-details';

describe('DrawerDraweeDetails', () => {
  let component: DrawerDraweeDetails;
  let fixture: ComponentFixture<DrawerDraweeDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawerDraweeDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrawerDraweeDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
