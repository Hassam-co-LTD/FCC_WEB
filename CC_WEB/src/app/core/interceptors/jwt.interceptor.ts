import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  const userDataString = sessionStorage.getItem('userData');

  let token: string | null = null;

  if (userDataString) {
    try {
      const userData = JSON.parse(userDataString);
      token = userData?.body?.token;
    } catch (e) {
      console.error('Invalid userData in sessionStorage', e);
    }
  }

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};