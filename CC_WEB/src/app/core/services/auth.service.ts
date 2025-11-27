import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  login(userId: string, companyId: string, password: string): boolean {
    // Dummy logic — will replace with API call's later onn
    if (userId === 'admin' && companyId === 'admin' && password === 'admin') {
      localStorage.setItem('token', 'dummy-token');
      localStorage.setItem('role', 'ADMIN');
      return true;
    }

    if (userId === 'user' && companyId === 'user' && password === 'user') {
      localStorage.setItem('token', 'dummy-token');
      localStorage.setItem('role', 'USER');
      return true;
    }

    return false;
  }

  logout() {
    localStorage.clear();
  }

  checkAuth(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserCategory(): 'ADMIN' | 'USER' | null {
    return localStorage.getItem('role') as any;
  }
}
