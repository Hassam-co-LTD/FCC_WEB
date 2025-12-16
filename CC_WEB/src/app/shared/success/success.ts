import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCard } from "@angular/material/card";
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-success',
  templateUrl: './success.html',
  styleUrls: ['./success.scss'],
  standalone: true,
  imports: [CommonModule, MatCard]
})
export class Success {
  data: any = {};
  pageName1: string = 'Button 1';
  pageName2: string = 'Button 2';

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state || {};
this.data = state['data'] || {};
this.pageName1 = state['pageName1'] || 'import LC Listing';
this.pageName2 = state['pageName2'] || 'new import LC';
  }
}
