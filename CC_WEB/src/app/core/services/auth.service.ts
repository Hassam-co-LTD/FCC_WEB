import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(userId: string, companyId: string, password: string): boolean {
    // Dummy logic — will replace with API call's later onn
    // if (userId === 'admin' && companyId === 'admin' && password === 'admin') {
    //   localStorage.setItem('token', 'dummy-token');
    //   localStorage.setItem('role', 'ADMIN');
    //   return true;
    // }

    // if (userId === 'user' && companyId === 'user' && password === 'user') {
    //   localStorage.setItem('token', 'dummy-token');
    //   localStorage.setItem('role', 'USER');
    //   return true;
    // }
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
  }

  checkAuth(): boolean {
    if (!this.isBrowser()) {
      return false;
    }
    return !!localStorage.getItem('token');
  }

  getUserCategory(): 'ADMIN' | 'USER' | null {
    if (!this.isBrowser()) {
      return null;
    }
    // return localStorage.getItem('role') as any;
    return localStorage.getItem('role') as 'ADMIN' | 'USER' | null;
  }
}

