import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);

  const token = sessionStorage.getItem('token');

  const refreshUrl = '/api/v1/auth/refresh-token';

  // Do not attach access token to refresh API
  if (req.url.includes(refreshUrl)) {
    return next(req);
  }

  let clonedRequest = req;

  // Attach JWT only if it is valid
  if (token && token !== 'undefined' && token !== 'null') {
    clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  } else {
    console.log('NO VALID ACCESS TOKEN FOUND');
  }

  return next(clonedRequest).pipe(
    catchError((error) => {
      console.log('HTTP ERROR STATUS:', error.status);

      // Access token expired
      if (error.status === 401) {
        const refreshToken = sessionStorage.getItem('refreshToken');

        if (!refreshToken || refreshToken === 'undefined') {
          console.log('NO REFRESH TOKEN AVAILABLE');

          sessionStorage.clear();

          return throwError(() => error);
        }

        console.log('Calling Refresh Token API...');

        return http
          .post<any>(
            'http://localhost:8050/secondAdmin/api/v1/auth/refresh-token',

            {
              refreshToken: refreshToken,
            },
          )

          .pipe(
            switchMap((response) => {
              console.log('FULL REFRESH RESPONSE:', response);

              /*
                 Supports both:
 
                 {
                    token:"xxxxx"
                 }
 
                 and
 
                 {
                    body:{
                       token:"xxxxx"
                    }
                 }
 
              */

              const newToken =
                response.accessToken ??
                response.token ??
                response.body?.accessToken ??
                response.body?.token;

              if (!newToken || newToken === 'undefined') {
                console.log('REFRESH RESPONSE DOES NOT CONTAIN TOKEN');

                sessionStorage.clear();

                return throwError(() => new Error('No access token returned'));
              }

              console.log('NEW ACCESS TOKEN:', newToken);

              sessionStorage.setItem('token', newToken);

              const retryRequest = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
              });

              console.log('RETRYING ORIGINAL REQUEST');

              return next(retryRequest);
            }),

            catchError((refreshError) => {
              console.log('REFRESH TOKEN FAILED:', refreshError);

              sessionStorage.clear();

              return throwError(() => refreshError);
            }),
          );
      }

      return throwError(() => error);
    }),
  );
};
