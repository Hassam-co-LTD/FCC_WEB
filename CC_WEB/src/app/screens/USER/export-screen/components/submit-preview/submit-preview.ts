import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../../../core/services/user-service/shared-form-service/shared-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-submit-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './submit-preview.html',
  styleUrls: ['./submit-preview.scss']
})
export class SubmitPage implements OnInit {

  form: any = null;
  attachmentsArray: any[] = [];

  constructor(private dataService: SharedService, private router: Router) {}

  ngOnInit() {
    const data = this.dataService.getFormData();

    if (!data) {
      alert("No data found! Please fill the form first.");
      this.router.navigate(['/export-screen']);
      return;
    }

    this.form = data;
    this.attachmentsArray = data.attachments || [];
  }

  downloadFile(i: number) {
    const fileData = this.attachmentsArray[i];
    const blob = new Blob([fileData.file], { type: fileData.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileData.fileName;
    a.click();
  }
}
