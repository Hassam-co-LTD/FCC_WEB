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
    // Same home page the login screen uses (also covers customer users)
    this.router.navigate([this.authService.getRedirectUrl()]);
  }
}