import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);

  const token = sessionStorage.getItem('token');
  const refreshToken = sessionStorage.getItem('refreshToken');

  const refreshUrl =
    `${environment.gatewayUrl}/secondAdmin/api/v1/auth/refresh-token`;

  const isValidToken = (value: string | null): boolean => {
    return !!value &&
      value !== 'undefined' &&
      value !== 'null' &&
      value.trim() !== '';
  };

  /*
   * Do not attach access token to refresh-token request.
   * Otherwise the refresh request itself can cause authentication problems.
   */
  if (req.url === refreshUrl) {
    return next(req);
  }

  /*
   * Attach access token if one exists.
   *
   * No token is NOT necessarily an error.
   * Login requests and other public APIs can legitimately have no token.
   */
  if (isValidToken(token)) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error) => {

      /*
       * Only try refresh for 401 Unauthorized.
       */
      if (error.status !== 401) {
        return throwError(() => error);
      }

      /*
       * Do not try to refresh if there is no refresh token.
       */
      if (!isValidToken(refreshToken)) {
        console.warn('No refresh token available.');

        sessionStorage.clear();

        return throwError(() => error);
      }

      console.log('Access token expired. Refreshing...');

      /*
       * Call refresh endpoint.
       */
      return http
        .post<any>(
          refreshUrl,
          {
            refreshToken: refreshToken,
          },
        )
        .pipe(

          switchMap((response) => {

            console.log('Refresh response received.');

            /*
             * Support different backend response formats.
             */
            const newToken =
              response?.accessToken ??
              response?.token ??
              response?.body?.accessToken ??
              response?.body?.token;

            if (!isValidToken(newToken)) {

              console.error(
                'Refresh succeeded but no access token was returned.'
              );

              sessionStorage.clear();

              return throwError(
                () => new Error('No access token returned from refresh API'),
              );
            }

            /*
             * Store new access token.
             */
            sessionStorage.setItem('token', newToken);

            console.log('Access token refreshed successfully.');

            /*
             * Retry original request with new token.
             */
            const retryRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
            });

            return next(retryRequest);
          }),

          catchError((refreshError) => {

            console.error(
              'Refresh token request failed:',
              refreshError,
            );

            /*
             * Refresh token is no longer usable.
             * Clear session and force user to login again.
             */
            sessionStorage.clear();

            return throwError(() => refreshError);
          }),
        );
    }),
  );
};
