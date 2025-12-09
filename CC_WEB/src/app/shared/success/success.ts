import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCard } from "@angular/material/card";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success',
  templateUrl: './success.html',
  styleUrls: ['./success.scss'],
  standalone:true,
  imports: [CommonModule, MatCard]
})
export class Success {
  data: any = {};

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.data = nav?.extras?.state || {};
  }
}
