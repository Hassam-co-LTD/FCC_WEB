import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-welcome-screen',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './welcome-screen.html',
  styleUrls: ['./welcome-screen.scss']
})
export class WelcomeScreen {
  title = '';
  description = '';

  constructor(private route: ActivatedRoute) {
    const data = this.route.snapshot.data;
    this.title = data['title'] || 'Welcome';
    this.description = data['description'] || '';
  }
}
