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

/*
 * Refresh-token endpoint.
 */
const refreshUrl = `${environment.gatewayUrl}/secondAdmin/api/v1/auth/refresh-token`;

/*
 * Share one refresh request across concurrent failed requests.
 */
let refreshInFlight$: Observable<string> | null = null;

/*
 * Check whether a token is usable.
 */
const isValidToken = (value: string | null | undefined): value is string => {
  return (
    !!value && value !== 'undefined' && value !== 'null' && value.trim() !== ''
  );
};

/*
 * Identify public endpoints.
 *
 * These endpoints can be called without a JWT.
 */
const publicEndpoints = [
  '/api/v1/clientUsers/login',
  '/api/v1/clientUsers/register',
  '/api/v1/clientUsers/forgot-password',
  '/api/v1/clientUsers/reset-password',
  '/api/v1/clientUsers/validate-reset-token',
  '/api/v1/clientUsers/change-password-by-user',
  '/api/v1/auth/refresh-token',
  '/api/v1/customer-registration/verify-bank-account',
  '/api/v1/customer-registration-requests',
];

/*
 * Check the URL path rather than the complete URL.
 *
 * This supports gateway-prefixed URLs such as:
 * /secondAdmin/api/v1/customer-registration-requests
 */
const isPublicEndpoint = (url: string): boolean => {
  let pathname: string;

  try {
    pathname = new URL(url, environment.gatewayUrl).pathname;
  } catch {
    pathname = url.split('?')[0];
  }

  return publicEndpoints.some((endpoint) => {
    return pathname === endpoint || pathname.endsWith(endpoint);
  });
};

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);
  const router = inject(Router);

  /*
   * Determine whether this is a public request.
   */
  const publicRequest = isPublicEndpoint(req.url);

  /*
   * Never attach an access token to public requests.
   *
   * This is important for customer registration because the customer
   * has not logged in yet.
   */
  if (publicRequest) {
    req = req.clone({
      headers: req.headers.delete('Authorization'),
    });
  } else {
    /*
     * Attach the access token to protected requests when available.
     */
    const token = getSessionItem('token');

    if (isValidToken(token)) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  }

  /*
   * Clear the local session and navigate to login when a protected
   * request cannot recover authentication.
   */
  const endSession = (): void => {
    clearSessionStorage();

    if (isBrowserEnv() && !router.url.startsWith('/login')) {
      void router.navigate(['/login']);
    }
  };

  /*
   * Refresh the access token.
   */
  const refreshAccessToken = (): Observable<string> => {
    if (!refreshInFlight$) {
      const refreshToken = getSessionItem('refreshToken');

      if (!isValidToken(refreshToken)) {
        return throwError(() => new Error('No valid refresh token available'));
      }

      console.log('Access token expired. Refreshing...');

      refreshInFlight$ = http
        .post<any>(refreshUrl, {
          refreshToken,
        })
        .pipe(
          map((response) => {
            /*
             * Support the response formats used by the backend.
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
             * Save the new access token.
             */
            setSessionItem('token', newToken);

            /*
             * Save a rotated refresh token if the backend returns one.
             */
            const newRefreshToken =
              response?.refreshToken ?? response?.body?.refreshToken;

            if (isValidToken(newRefreshToken)) {
              setSessionItem('refreshToken', newRefreshToken);
            }

            console.log('Access token refreshed successfully.');

            return newToken;
          }),

          /*
           * Reset the shared observable after the refresh finishes.
           */
          finalize(() => {
            refreshInFlight$ = null;
          }),

          shareReplay({
            bufferSize: 1,
            refCount: false,
          }),
        );
    }

    return refreshInFlight$;
  };

  /*
   * Send the request and handle authentication errors.
   */
  return next(req).pipe(
    catchError((error: unknown) => {
      /*
       * Only HTTP 401 responses can trigger token refresh.
       *
       * Other errors, including 403 Forbidden, are passed through.
       */
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      /*
       * Public endpoints must not trigger token refresh or redirects.
       */
      if (publicRequest) {
        return throwError(() => error);
      }

      /*
       * Do not attempt refresh if there is no valid refresh token.
       */
      if (!isValidToken(getSessionItem('refreshToken'))) {
        console.warn('No refresh token available.');

        endSession();

        return throwError(() => error);
      }

      /*
       * Refresh the token and retry the original protected request.
       */
      return refreshAccessToken().pipe(
        catchError((refreshError: unknown) => {
          console.error('Refresh token request failed:', refreshError);

          endSession();

          return throwError(() => error);
        }),

        switchMap((newToken) => {
          const retryRequest = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`,
            },
          });

          return next(retryRequest);
        }),
      );
    }),
  );
};
