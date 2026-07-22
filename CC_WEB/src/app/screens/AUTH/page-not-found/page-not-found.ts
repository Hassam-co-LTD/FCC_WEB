import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './page-not-found.html',
  styleUrl: './page-not-found.scss',
})
export class PageNotFound {

  constructor(private router: Router, private authService: AuthService) { }

  goToDashboard(): void {
    const userCategory = this.authService.getUserCategory();

    if (userCategory === 'A') {
      this.router.navigate(['/admin']);
    } else if (userCategory === 'U') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}