import { Component, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
  imports: [CommonModule, MatIcon, DecimalPipe],
  standalone: true,
  animations: [
    trigger('popupAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.5)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('250ms ease-in', style({ opacity: 0, transform: 'scale(0.5)' }))
      ])
    ])
  ]
})
export class Preview {
  @Input() form!: FormGroup;

  isOpen = true;

  viewerOpen = false;
  viewerContent: SafeResourceUrl | null = null;
  isImage = false;
  isPdf = false;
  popupClass = '';

  constructor(private sanitizer: DomSanitizer) { }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  get attachmentsArray(): FormArray {
    return (this.form.get('attachments') as FormArray)
  }

  // getValue(controlName: string, field: string) {
  //   return this.form?.get(controlName)?.value?.[field] ?? '';
  // }

  // viewFile(index: number) {
  //   const data = this.attachmentsArray.at(index)?.value;
  //   const file = data?.file;
  //   if (!file) return;

  //   if (file instanceof Blob) {
  //     const url = URL.createObjectURL(file);
  //     this.openViewer(url, file.type);
  //     return;
  //   }

  //   if (typeof file === 'string' && file.startsWith('data:')) {
  //     const mime = file.substring(file.indexOf(':') + 1, file.indexOf(';'));
  //     this.openViewer(file, mime);
  //     return;
  //   }

  //   console.error("Unknown file format");
  // }

  // openViewer(url: string, mime: string) {
  //   if (mime.includes('image')) {
  //     this.isImage = true;
  //     this.isPdf = false;
  //     this.viewerContent = url;
  //   } else {
  //     this.isImage = false;
  //     this.isPdf = true;
  //     this.viewerContent = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  //   }

  //   this.viewerOpen = true;

  //   // Set popup class to trigger CSS
  //   this.popupClass = 'open';

  //   // Add body class for blur effect
  //   document.body.classList.add('popup-open');
  // }

  // closeViewer() {
  //   this.viewerOpen = false;
  //   this.viewerContent = null;
  //   this.popupClass = '';

  //   // Remove body blur
  //   document.body.classList.remove('popup-open');
  // }


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
