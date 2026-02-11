import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from './api.service';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(userId: string, companyId: string, password: string): boolean {
       this.api.saveTnx({ userId, companyId, password }, 'login').subscribe({
      next: response => console.log('Login response:', response),
      error: err => console.error('Login error:', err)
    }); 
    if ((userId === 'admin' && companyId === 'admin' && password === 'admin') ||
      (userId === 'user' && companyId === 'ABC' && password === 'user') || 
      (userId === 'NBP-01' && companyId === 'NBP' && password === 'NBP')) {

      if (this.isBrowser()) {
        sessionStorage.setItem('token', 'dummy-token');
        sessionStorage.setItem('userId', userId);
        sessionStorage.setItem('companyId', companyId);
        sessionStorage.setItem('role', userId === 'admin' ? 'ADMIN' : 'USER');
        sessionStorage.setItem('userRole', userId === 'admin' ? 'ADMIN' : 'USER');
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
    else{
      console.log("you are on the serve")
    }
  }

  checkAuth(): boolean {
    if (!this.isBrowser()) {
      return false;
    }

    return !!sessionStorage.getItem('token');
  }

  getUserCategory(): 'ADMIN' | 'USER' | null {
    if (!this.isBrowser()) {
      return null;
    }

    return sessionStorage.getItem('role') as 'ADMIN' | 'USER' | null;
  }

  getCompanyId(): string | null {
    return sessionStorage.getItem('companyId');
  }

  // ✅ ADDED METHODS
  getUserId(): string | null {
    return sessionStorage.getItem('userId');
  }

  getUserRole(): string | null {
    return sessionStorage.getItem('role') || sessionStorage.getItem('userRole');
  }

  getCurrentUser() {
    return {
      userId: this.getUserId(),
      companyId: this.getCompanyId(),
      role: this.getUserCategory()
    };
  }

  // Simple permission checks
  canTransfer(): boolean {
    const role = this.getUserCategory();
    return role === 'USER' || role === 'ADMIN';
  }

  canApprove(): boolean {
    const role = this.getUserCategory();
    return role === 'ADMIN';
  }

  canReject(): boolean {
    return this.canApprove();
  }
}