import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../../../../../../../core/services/user-service/shared-form-service/shared-service';
import { CommonModule } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-export-preview',
  standalone: true,
  imports: [CommonModule, MatCard, MatIconModule],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss']
})
export class ExportPreview implements OnInit {

  form: any = {};
  attachmentsArray: any[] = [];

  constructor(private sharedService: SharedService, private router: Router) {}

  ngOnInit() {
    const data = this.sharedService.getFormData() || {};
    this.form = data;

    if (data.attachments?.preview?.length) {
      this.attachmentsArray = data.attachments.preview.map((item: any, index: number) => ({
        title: item.title,
        fileName: item.fileName,
        size: item.size,
        type: item.type,
        file: data.attachments.files[index] // actual File object
      }));
    } else {
      this.attachmentsArray = [];
    }
  }

  downloadFile(index: number) {
    const file = this.attachmentsArray[index];
    if (!file || !file.file) return;

    const blob = new Blob([file.file], { type: file.type });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = file.fileName || 'file';
    link.click();
  }

  previous() {
    this.router.navigate(['/export-screen']);
  }

  submit() {
  const formData = this.sharedService.getFormData();

  this.router.navigate(['/export-screen/success'], {
    state: {
      type: 'export',
      data: formData,
      pageName1: 'Export Collection',  // dynamic button label
      pageName2: 'New Export Listing'  // dynamic button label
    }
  });
}

}
