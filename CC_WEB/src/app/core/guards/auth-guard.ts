import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  console.log('🛠️ authGuard triggered');

  // Don't fail SSR — assume logged out but don't redirect
  const isBrowser = auth['isBrowser']();  

  const isLoggedIn = isBrowser ? auth.checkAuth() : true; 
  const userRole = isBrowser ? auth.getUserCategory() : null;

  console.log('isLoggedIn:', isLoggedIn, 'userRole:', userRole);

  if (isBrowser && !isLoggedIn) {
    console.error('❌ User not logged in, redirecting to /login');
    router.navigate(['/login']);
    return false;
  }

  const requiredRole = route.data?.['role'] as 'ADMIN' | 'USER' | null;

  if (isBrowser && requiredRole && userRole !== requiredRole) {
    router.navigate([userRole === 'ADMIN' ? '/admin' : '/dashboard']);
    return false;
  }

  return true;
};