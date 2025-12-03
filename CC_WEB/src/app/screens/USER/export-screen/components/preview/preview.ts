import { Component, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule} from '@angular/common';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-preview',
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
  imports: [CommonModule, MatIcon],
  standalone: true,
})
export class Preview {
  @Input() form!: FormGroup;
  isOpen = true;

  viewerOpen = false;
  viewerContent: SafeResourceUrl | null = null;
  isImage = false;
  isPdf = false;

  constructor(private sanitizer: DomSanitizer) { }

  toggle() { this.isOpen = !this.isOpen; }

  get attachmentsArray(): FormArray {
    return (this.form.get('attachments') as FormArray) ?? new FormArray([]);
  }

  downloadFile(index: number) {
    const data = this.attachmentsArray.at(index)?.value;
    if (!data) return;

    const { file, fileName } = data;
    let blob: Blob;

    if (file instanceof Blob) blob = file;
    else if (typeof file === 'string' && file.startsWith('data:')) {
      const arr = file.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] ?? '';
      const bstr = atob(arr[1]);
      const u8arr = new Uint8Array(bstr.length);
      for (let n = 0; n < bstr.length; n++) u8arr[n] = bstr.charCodeAt(n);
      blob = new Blob([u8arr], { type: mime });
    } else return console.error("Unsupported file format", file);

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
}
