import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  catchError,
  finalize,
  map,
  Observable,
  shareReplay,
  switchMap,
  throwError,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  clearSessionStorage,
  getSessionItem,
  isBrowserEnv,
  setSessionItem,
} from '../utils/browser-storage';

const refreshUrl = `${environment.gatewayUrl}/secondAdmin/api/v1/auth/refresh-token`;

/*
 * A single in-flight refresh shared by every request that hits a 401 at the
 * same time, so parallel calls do not each fire their own refresh request
 * (which fails when the backend rotates refresh tokens).
 */
let refreshInFlight$: Observable<string> | null = null;

const isValidToken = (value: string | null | undefined): value is string => {
  return !!value &&
    value !== 'undefined' &&
    value !== 'null' &&
    value.trim() !== '';
};

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);
  const router = inject(Router);

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
   * On the server there is no sessionStorage, so the token is simply absent.
   */
  const token = getSessionItem('token');

  if (isValidToken(token)) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /*
   * Session can no longer be recovered: clear it and send the user to login.
   */
  const endSession = () => {
    clearSessionStorage();

    if (isBrowserEnv() && !router.url.startsWith('/login')) {
      router.navigate(['/login']);
    }
  };

  const refreshAccessToken = (): Observable<string> => {
    if (!refreshInFlight$) {
      console.log('Access token expired. Refreshing...');

      refreshInFlight$ = http
        .post<any>(refreshUrl, { refreshToken: getSessionItem('refreshToken') })
        .pipe(
          map((response) => {
            /*
             * Support different backend response formats.
             */
            const newToken =
              response?.accessToken ??
              response?.token ??
              response?.body?.accessToken ??
              response?.body?.token;

            if (!isValidToken(newToken)) {
              throw new Error('No access token returned from refresh API');
            }

            /*
             * Store new access token (and a rotated refresh token, if sent).
             */
            setSessionItem('token', newToken);

            const newRefreshToken =
              response?.refreshToken ?? response?.body?.refreshToken;
            if (isValidToken(newRefreshToken)) {
              setSessionItem('refreshToken', newRefreshToken);
            }

            console.log('Access token refreshed successfully.');
            return newToken;
          }),
          finalize(() => (refreshInFlight$ = null)),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
    }

    return refreshInFlight$;
  };

  return next(req).pipe(
    catchError((error: unknown) => {
      /*
       * Only try refresh for 401 Unauthorized.
       */
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      /*
       * Do not try to refresh if there is no refresh token.
       */
      if (!isValidToken(getSessionItem('refreshToken'))) {
        console.warn('No refresh token available.');

        endSession();

        return throwError(() => error);
      }

      return refreshAccessToken().pipe(
        catchError((refreshError) => {
          console.error('Refresh token request failed:', refreshError);

          /*
           * Refresh token is no longer usable.
           * Clear session and force user to login again.
           */
          endSession();

          return throwError(() => error);
        }),
        /*
         * Retry original request with new token.
         */
        switchMap((newToken) =>
          next(
            req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
            }),
          ),
        ),
      );
    }),
  );
};
