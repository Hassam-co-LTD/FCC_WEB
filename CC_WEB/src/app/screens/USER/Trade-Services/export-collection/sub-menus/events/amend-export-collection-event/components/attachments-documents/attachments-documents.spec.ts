import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentsDocuments } from './attachments-documents';

describe('AttachmentsDocuments', () => {
  let component: AttachmentsDocuments;
  let fixture: ComponentFixture<AttachmentsDocuments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttachmentsDocuments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttachmentsDocuments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
