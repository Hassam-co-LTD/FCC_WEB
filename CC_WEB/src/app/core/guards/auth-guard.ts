    import { inject } from '@angular/core';
    import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
    import { AuthService } from '../services/auth.service'; // adjust path if needed

    export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
      const auth = inject(AuthService);
      const router = inject(Router);

      if (!auth.checkAuth()) {
        router.navigate(['/login']);
        return false;
      }

      const requiredRole = route.data?.['role'] as 'ADMIN' | 'USER' | undefined;
      const userRole = auth.getUserCategory();

      if (requiredRole && userRole !== requiredRole) {
        alert('You are not authorized to access this page');
        router.navigate([userRole === 'ADMIN' ? '/admin' : '/dashboard']);
        return false;
      }

      return true;
    };
