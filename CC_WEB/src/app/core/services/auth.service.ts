import { Injectable, PLATFORM_ID, inject, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import {
  clearLocalStorage,
  clearSessionStorage,
  getSessionItem,
  readSessionJson,
  removeSessionItem,
  setSessionItem,
} from '../utils/browser-storage';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /** Stored login data; always an object, never throws on missing/corrupt data */
  private readUserData(): any {
    const data = readSessionJson<any>('userData', {});
    return data && typeof data === 'object' ? data : {};
  }

  private writeUserData(data: any): void {
    setSessionItem('userData', JSON.stringify(data));
  }

  /** Dummy login for testing */
  login(userId: string, companyId: string, password: string): boolean {
    if (
      (userId === 'admin' && companyId === 'admin' && password === 'admin') ||
      (userId === 'user' && companyId === 'ABC' && password === 'user') ||
      (userId === 'NBP-01' && companyId === 'NBP' && password === 'NBP')
    ) {
      if (this.isBrowser()) {
        const role = userId === 'admin' ? 'A' : 'U';

        const userData = {
          userId: userId,
          companyId: companyId,
          userCategory: role,
          companyType: companyId === 'NBP' ? 'B' : 'U',
        };

        this.writeUserData(userData);
        setSessionItem('token', 'dummy-token');
      }

      return true;
    }

    return false;
  }

  /** Clear auth data without showing any dialog */
  clearSession(): void {
    removeSessionItem('token');
    removeSessionItem('refreshToken');
    removeSessionItem('userData');
    clearSessionStorage();
    clearLocalStorage();
  }

  /** Logout */

  logout(): void {
    if (this.isBrowser()) {
      console.log('========== LOGOUT START ==========');

      this.clearSession();

      console.log('Session storage cleared');

      this.ngZone.run(() => {
        Swal.fire({
          icon: 'warning',

          title: 'Session Expired',

          text: 'Your session has expired due to inactivity. Please login again.',

          confirmButtonText: 'Login Again',

          allowOutsideClick: false,

          allowEscapeKey: false,
        })
          .then(() => {
            console.log('Redirecting to login...');

            this.router.navigate(['/login']);
          })
          .catch(() => this.router.navigate(['/login']));
      });
    } else {
      console.log('You are on the server');
    }
  }
  /** Check if user is logged in (sessionStorage contains backend userData) */
  checkAuth(): boolean {
    return !!getSessionItem('userData');
  }

  getUserCategory(): 'A' | 'U' | null {
    const parsed = this.readUserData();

    const userCategory = parsed.body?.userCategory ?? parsed.userCategory;

    if (!userCategory || typeof userCategory !== 'string') return null;

    return userCategory.toUpperCase() === 'A' ? 'A' : 'U';
  }
  /** Get companyId from sessionStorage */
  getCompanyId(): string | null {
    const parsed = this.readUserData();
    return parsed.companyId ?? parsed.body?.companyId ?? null;
  }

  /** Get userId from sessionStorage */
  getUserId(): number | null {
    return this.readUserData().userId ?? null;
  }
  getToken(): string | null {
    return getSessionItem('token');
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
    const parsed = this.readUserData();
    const companyType = parsed.body?.companyType ?? parsed.companyType;

    if (!companyType || typeof companyType !== 'string') return null;

    return companyType.toUpperCase() as 'B' | 'C';
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
    const parsed = this.readUserData();
    parsed.userCategory = value;
    this.writeUserData(parsed);
  }
  setCompanyType(value: 'B' | 'C') {
    if (!this.isBrowser()) return;
    const parsed = this.readUserData();
    parsed.companyType = value;
    this.writeUserData(parsed);
  }

  // get userName()
  getUserName(): string | null {
    return this.readUserData().userName || null;
  }

  //  get LoginId()
  getLoginId(): string | null {
    return this.readUserData().loginId || null;
  }

  getSubmitPayload() {
    return {
      recordStatus: 'S',
      inputterId: this.getLoginId() ?? '',
    };
  }

  getApprovePayload() {
    return {
      recordStatus: 'A',
      authorizerId: this.getLoginId() ?? '',
    };
  }

  getRejectPayload(rejectReason: string) {
    return {
      recordStatus: 'R',
      rejectReason: rejectReason,
      rejectedBy: this.getLoginId() ?? '',
    };
  }

  getAmendPayload() {
    return {
      recordStatus: 'I',
      updatedBy: this.getLoginId() ?? '',
    };
  }
}
