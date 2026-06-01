import { HttpRequest, HttpHandlerFn, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn =
  (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {

    const authService = inject(AuthService);
    const token = authService.getToken();

    // ✅ Skip auth for login/register APIs
    const isAuthRequest =
      req.url.includes('/login') ||
      req.url.includes('/register');

    let modifiedReq = req;

    if (token && !isAuthRequest) {
      modifiedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    console.log('REQUEST URL:', req.url);
    console.log('TOKEN:', token);
    console.log('AUTH HEADER:', modifiedReq.headers.get('Authorization'));

    return next(modifiedReq);
  };