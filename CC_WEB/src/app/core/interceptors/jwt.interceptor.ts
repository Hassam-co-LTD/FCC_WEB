// jwt.interceptor.ts
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService); // inject standalone service
  const token = authService.getToken(); // your method to get JWT
  const cloned = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(cloned);
};