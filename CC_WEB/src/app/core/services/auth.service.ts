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
        sessionStorage.setItem('token', 'dummy-token');
        sessionStorage.setItem('userId', userId);
        sessionStorage.setItem('companyId', companyId);
        sessionStorage.setItem('role', userId === 'admin' ? 'ADMIN' : 'USER');
      }

      return true;
    }

    return false;
  }

  logout() {
    if (this.isBrowser()) {
      sessionStorage.clear();
      localStorage.clear();
    }
  }

  checkAuth(): boolean {
    if (!this.isBrowser()) {
      console.warn('⚠️ checkAuth called outside browser, returning false');
      return false;
    }

    return !!sessionStorage.getItem('token');
  }

  getUserCategory(): 'ADMIN' | 'USER' | null {
    if (!this.isBrowser()) {
      console.warn('⚠️ getUserCategory called outside browser, returning null');
      return null;
    }

    return sessionStorage.getItem('role') as 'ADMIN' | 'USER' | null;
  }

  getCompanyId(): string | null {
    return sessionStorage.getItem('companyId');
  }
}