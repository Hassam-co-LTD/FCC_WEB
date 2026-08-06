import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

function findData(route: ActivatedRouteSnapshot, key: string): any {
  let current: ActivatedRouteSnapshot | null = route;
  while (current) {
    if (current.data && current.data[key] !== undefined) return current.data[key];
    current = current.parent;
  }
  return undefined;
}
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth['isBrowser']()) return true; // don't block SSR

  if (!auth.checkAuth()) {
    router.navigate(['/login']);
    return false;
  }

  const userRole = auth.getUserCategory();        // 'A' | 'U' | null
  const userCompanyType = auth.getCompanyType();   // 'B' | 'C' | null

  const requiredRole = findData(route, 'role') as 'A' | 'U' | undefined;
  const requiredCompanyType = findData(route, 'companyType') as 'B' | 'C' | undefined;

  const roleOk = !requiredRole || userRole === requiredRole;
  const companyTypeOk = !requiredCompanyType || userCompanyType === requiredCompanyType;

  if (!roleOk || !companyTypeOk) {
    router.navigate([auth.getRedirectUrl()]); // send them to their OWN home, not blocked page
    return false;
  }

  return true;
};
// export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
//   const auth = inject(AuthService);
//   const router = inject(Router);

//   console.log('🛠️ authGuard triggered');

//   // Don't fail SSR — assume logged out but don't redirect
//   const isBrowser = auth['isBrowser']();  

//   const isLoggedIn = isBrowser ? auth.checkAuth() : true; 
//   const userRole = isBrowser ? auth.getUserCategory() : null;

//   console.log('isLoggedIn:', isLoggedIn, 'userRole:', userRole);

//   if (isBrowser && !isLoggedIn) {
//     console.error('❌ User not logged in, redirecting to /login');
//     // router.navigate(['/login']);
//     router.navigate(['/admin'])
//     return false;
//   }

//   const requiredRole = route.data?.['role'] as 'A' | 'U' | null;

//   if (isBrowser && requiredRole && userRole !== requiredRole) {
//     router.navigate([userRole === 'A' ? '/admin' : '/dashboard']);
//     return false;
//   }

//   return true;
// };