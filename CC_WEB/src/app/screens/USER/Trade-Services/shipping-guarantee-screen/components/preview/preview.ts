import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedService } from '../../../../../../core/services/user-service/shared-form-service/shared-service';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from "@angular/material/icon";
import { NgModule } from '@angular/core';
interface PreviewFile {
  file: File | Blob | string;
  fileName: string;
  size: number;
  type: string;
  title?: string;
}

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIcon],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss']
})
export class Preview implements OnInit {

  previewData: any = {
    generalDetails: {},
    applicantBeneficiary: {},
    bankDetails: {},
    instructions: {},
    attachments: { files: [], preview: [] }
  };

  attachmentsArray: PreviewFile[] = [];

  constructor(private sharedService: SharedService, private router: Router) {}

  ngOnInit(): void {
    const data = this.sharedService.getFormData() || {};

    // Ensure attachments exist
    if (!data.attachments) {
      data.attachments = { files: [], preview: [] };
    }

    // Populate preview array if missing
    if (!data.attachments.preview || data.attachments.preview.length === 0) {
      data.attachments.preview = data.attachments.files.map((file: File) => ({
        file,
        fileName: file.name,
        size: file.size,
        type: file.type,
        title: file.name.replace(/\.[^/.]+$/, '')
      }));
    }

    this.previewData = data;
    this.attachmentsArray = data.attachments.preview;
  }

  formatFileSize(n: number) {
    if (n < 1024) return `${n} B`;
    if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1048576).toFixed(1)} MB`;
  }

  downloadFile(index: number) {
    const file = this.attachmentsArray[index];
    if (!file) return;

    if (file.file instanceof Blob) {
      const url = URL.createObjectURL(file.file);
      this.triggerDownload(url, file.fileName);
      URL.revokeObjectURL(url);
      return;
    }

    if (typeof file.file === 'string' && file.file.startsWith('data:')) {
      const arr = file.file.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] ?? '';
      const bstr = atob(arr[1]);
      const u8arr = new Uint8Array(bstr.length);
      for (let n = 0; n < bstr.length; n++) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const url = URL.createObjectURL(blob);
      this.triggerDownload(url, file.fileName);
      URL.revokeObjectURL(url);
      return;
    }

    console.error("Unsupported file format", file.file);
  }

  private triggerDownload(url: string, fileName: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  }

  removeFile(index: number) {
    this.attachmentsArray.splice(index, 1);
    this.previewData.attachments.preview = [...this.attachmentsArray];
  }

  back() {
    this.router.navigate(['shipping-guarantee']);
  }

  submit() {
    const formData = this.sharedService.getFormData(); // shipping form data

    this.router.navigate(['/shipping-guarantee/success'], {
      state: {
        type: 'shipping',
        data: formData,
        pageName1: 'Shipping LC Listing',
        pageName2: 'New Shipping LC'
      }
    });
  }
}
