import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  getCurrentUser() {
    throw new Error('Method not implemented.');
  }
  private platformId = inject(PLATFORM_ID);

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(userId: string, companyId: string, password: string): boolean {
    if ((userId === 'admin' && companyId === 'admin' && password === 'admin') ||
        (userId === 'user' && companyId === 'user' && password === 'user')) {

      if (this.isBrowser()) {
        localStorage.setItem('token', 'dummy-token');
        localStorage.setItem('role', userId === 'admin' ? 'ADMIN' : 'USER');
      }

      return true;
    }

    return false;
  }

  logout() {
    if (this.isBrowser()) {
      localStorage.clear();
    }
    else{
      console.log("you are on the serve")
    }
  }

  checkAuth(): boolean {
    if (!this.isBrowser()) {
      console.warn('⚠️ checkAuth called outside browser, returning false');
      return false;
    }

    return !!localStorage.getItem('token');
  }

  getUserCategory(): 'ADMIN' | 'USER' | null {
    if (!this.isBrowser()) {
      console.warn('⚠️ getUserCategory called outside browser, returning null');
      return null;
    }

    return localStorage.getItem('role') as 'ADMIN' | 'USER' | null;
  }
}