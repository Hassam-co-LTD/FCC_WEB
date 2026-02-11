import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-reject-dialog',
  templateUrl: './reject-dialog.html',
  styleUrls: ['./reject-dialog.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule] // Add MatButtonModule
})
export class RejectDialogComponent {
  reason = new FormControl('', [
    Validators.required,
    Validators.maxLength(250)
  ]);

  constructor(private dialogRef: MatDialogRef<RejectDialogComponent>) { }

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
    console.log('Confirm called, reason value:', this.reason.value); // Add log
    if (this.reason.valid) {
      this.dialogRef.close(this.reason.value!); 
    }
  }
}