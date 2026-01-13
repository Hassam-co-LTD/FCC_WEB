import { Component } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reject-dialog',
  templateUrl: './reject-dialog.html',
  styleUrls: ['./reject-dialog.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class RejectDialogComponent {
  reason = new FormControl('', [
    Validators.required,
    Validators.maxLength(250)
  ]);

  constructor(private dialogRef: DialogRef<string>) { }
  get errorMessage(): string {
    if (this.reason.hasError('required')) {
      return 'Rejection reason is required.';
    }
    if (this.reason.hasError('maxlength')) {
      return 'Rejection reason cannot exceed 250 characters.';
    }
    return '';
  }
  close() {
    this.dialogRef.close();
  }

  confirm() {
    if (this.reason.valid) {
      this.dialogRef.close(this.reason.value!); 
    }
  }
}
