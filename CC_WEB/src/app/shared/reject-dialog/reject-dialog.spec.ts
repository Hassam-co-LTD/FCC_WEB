import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectDialog } from './reject-dialog';

describe('RejectDialog', () => {
  let component: RejectDialog;
  let fixture: ComponentFixture<RejectDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RejectDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
