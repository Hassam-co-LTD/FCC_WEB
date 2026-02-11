import { Component, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
  imports: [CommonModule, MatIcon, DecimalPipe],
  standalone: true,
})
export class Preview {
  @Input() form!: FormGroup;

  isOpen = true;

  viewerOpen = false;
  viewerContent: SafeResourceUrl | null = null;
  isImage = false;
  isPdf = false;

  constructor() { }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  get attachmentsArray(): FormArray {
    return (this.form.get('attachments') as FormArray)
  }


  downloadFile(index: number) {
    const data = this.attachmentsArray.at(index)?.value;
    if (!data) return;

    const { file, fileName } = data;

    if (file instanceof Blob) {
      const url = URL.createObjectURL(file);
      this.triggerDownload(url, fileName);
      URL.revokeObjectURL(url);
      return;
    }

    if (typeof file === 'string' && file.startsWith('data:')) {
      const arr = file.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] ?? '';
      const bstr = atob(arr[1]);
      const u8arr = new Uint8Array(bstr.length);
      for (let n = 0; n < bstr.length; n++) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const url = URL.createObjectURL(blob);
      this.triggerDownload(url, fileName);
      URL.revokeObjectURL(url);
      return;
    }

    console.error("Unsupported file format", file);
  }

  private triggerDownload(url: string, fileName: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  }
}
