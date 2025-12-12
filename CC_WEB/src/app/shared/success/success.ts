import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCard } from "@angular/material/card";


@Component({
  selector: 'app-success',
  templateUrl: './success.html',
  styleUrls: ['./success.scss'],
  standalone:true,
  imports: [MatCard]
})
export class Success {
  data: any = {};

  constructor(private router: Router) {
    const nav = this.router.currentNavigation();
    this.data = nav?.extras?.state || {};
  }
}
