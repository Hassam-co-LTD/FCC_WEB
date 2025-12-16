import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-success',
  templateUrl: './success.html',
  styleUrls: ['./success.scss'],
  standalone:  true,
  imports: [CommonModule, MatTableModule, MatButtonModule]
})
export class Success {
  data: any = {};
  pageName1: string = 'Button 1';
  pageName2: string = 'Button 2';
  displayedColumns: string[] = [];

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state || {};
this.data = state['data'] || {};
this.pageName1 = state['pageName1'] || 'import LC Listing';
this.pageName2 = state['pageName2'] || 'new import LC';
    this.displayedColumns = this.objectKeys(this.data).sort((a, b) => a.localeCompare(b));
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  displayValue(value: any): string {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return value;
  }

  goToListing() {
    this.router.navigate(['/import-screen/listing']);
  }

  createNew() {
    this.router.navigate(['/import-screen/new']);
  }
}
