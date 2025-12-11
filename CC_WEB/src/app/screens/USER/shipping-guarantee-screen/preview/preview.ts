import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../../core/services/user-service/shared-form-service/shared-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-shipping-preview',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss']
})
export class ShippingPreview implements OnInit {
  form: any = null;
  attachmentsArray: any[] = [];

  constructor(private dataService: SharedService, private router: Router) {}

  ngOnInit() {
    const data = this.dataService.getFormData();
    if (!data) {
      alert("No data found! Please fill the form again.");
      this.router.navigate(['/shipping-guarantee']);
      return;
    }
    this.form = data;
    this.attachmentsArray = data.attachments || [];
  }

  previous() {
    this.router.navigate(['/shipping-guarantee']);
  }

  submit() {
    this.router.navigate(['/shipping-guarantee/submit']);
  }
}
