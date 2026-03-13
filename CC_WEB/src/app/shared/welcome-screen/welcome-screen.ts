import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-welcome-screen',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './welcome-screen.html',
  styleUrls: ['./welcome-screen.scss']
})
export class WelcomeScreen {

  title = '';
  description = '';

  createRoute = '';
  templateRoute = '';
  existingRoute = '';
  uploadRoute = '';

  constructor(private route: ActivatedRoute, private router: Router) {
    const data = this.route.snapshot.data;

    this.title = data['title'] || 'Welcome';
    this.description = data['description'] || '';

    this.createRoute = data['createRoute'];
    this.templateRoute = data['templateRoute'];
    this.existingRoute = data['existingRoute'];
    this.uploadRoute = data['uploadRoute'];
  }

  navigate(path: string) {
    if (path) {
      this.router.navigate([path]);
    }
  }
}