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

  /** Dummy login for testing */
 login(userId: string, companyId: string, password: string): boolean {

  if ((userId === 'admin' && companyId === 'admin' && password === 'admin') ||
      (userId === 'user' && companyId === 'ABC' && password === 'user') || 
      (userId === 'NBP-01' && companyId === 'NBP' && password === 'NBP')) {

    if (this.isBrowser()) {

      const role = userId === 'admin' ? 'A' : 'U';

      const userData = {
        userId: userId,
        companyId: companyId,
        userCategory: role,
        companyType: companyId === 'NBP' ? 'B' : 'C'
      };

      sessionStorage.setItem('userData', JSON.stringify(userData));
      sessionStorage.setItem('token', 'dummy-token');

    }

    return true;
  }

  return false;
}

  /** Logout */
  logout() {
    if (this.isBrowser()) {
      sessionStorage.clear();
      localStorage.clear();
    } else {
      console.log("You are on the server");
    }
  }

  /** Check if user is logged in (sessionStorage contains backend userData) */
  checkAuth(): boolean {
    return !!sessionStorage.getItem('userData');
  }
 /** Get normalized user category (ADMIN / USER) */
  getUserCategory(): 'A' | 'U' | null {
    const data = sessionStorage.getItem('userData');
    if (!data) return null;

    const parsed = JSON.parse(data);
    return parsed.body.userCategory?.toUpperCase() === 'A' ? 'A' : 'U';
  }
  /** Get companyId from sessionStorage */
  getCompanyId(): string | null {
    const data = sessionStorage.getItem('userData');
    if (!data) return null;
    const parsed = JSON.parse(data);
    return parsed.companyId || null;
  }

  /** Get userId from sessionStorage */
  getUserId(): string | null {
    const data = sessionStorage.getItem('userData');
    if (!data) return null;
    const parsed = JSON.parse(data);
    return parsed.userId?.toString() || null;
  }

 getToken(): string | null {
  return sessionStorage.getItem('token');
}
  /** Get role (ADMIN / USER) */
  getUserRole(): 'A' | 'U' | null {
    return this.getUserCategory();
  }

  /** Permissions helpers */
  canTransfer(): boolean {
    const role = this.getUserCategory();
    return role === 'U' || role === 'A';
  }

  canApprove(): boolean {
    return this.getUserCategory() === 'A';
  }

  canReject(): boolean {
    return this.canApprove();
  }
  getCompanyType(): 'B' | 'C' | null {
    const data = sessionStorage.getItem('userData');
    console.log("getCompanyType - raw session data:", data);
    if (!data) return null;
    const parsed = JSON.parse(data);
    
    return parsed.body.companyType?.toUpperCase() || null;
  }

  getRedirectUrl(): string {
  const companyType = this.getCompanyType();
  const userCategory = this.getUserCategory();

  if (companyType === 'B') {
    return '/customer-user';
  } else if (companyType === 'C' && userCategory === 'A') {
    return '/admin';
  } else if (companyType === 'C' && userCategory === 'U') {
    return '/dashboard';
  }

  return '/login';
}
  setUserCategory(value: 'A' | 'U') {
    if (!this.isBrowser()) return;
    const data = sessionStorage.getItem('userData');
    const parsed = data ? JSON.parse(data) : {};
    parsed.userCategory = value;
    sessionStorage.setItem('userData', JSON.stringify(parsed));
  }
  setCompanyType(value: 'B' | 'C') {
    if (!this.isBrowser()) return;
    const data = sessionStorage.getItem('userData');
    const parsed = data ? JSON.parse(data) : {};
    parsed.companyType = value;
    sessionStorage.setItem('userData', JSON.stringify(parsed));
  }
}