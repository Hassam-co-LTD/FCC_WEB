import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import {
  GlobalErrorHandler,
  isChunkLoadError,
  reloadForChunkError,
} from './core/errors/global-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNativeDateAdapter(),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      // A failed navigation (e.g. lazy chunk missing after a redeploy, or a
      // component throwing while it is created) must not leave the app stuck.
      // The user stays on the current page; GlobalErrorHandler shows a notice.
      withNavigationErrorHandler((navError) => {
        console.error('Navigation failed:', navError.url, navError.error);

        if (isChunkLoadError(navError.error) && typeof window !== 'undefined') {
          reloadForChunkError();
        }
      }),
    ),
    // SSR is not enabled in angular.json, so there is nothing to hydrate
    // (hydration without server HTML logs NG0505 on every load). Re-add
    // provideClientHydration(withEventReplay()) if SSR is turned back on.

    // Catch anything not handled elsewhere
    { provide: ErrorHandler, useClass: GlobalErrorHandler },

    // Remove reserved hint/error space under every mat-form-field
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { subscriptSizing: 'dynamic' },
    },

    // HttpClient with interceptor (fetch backend is recommended for SSR)
    provideHttpClient(
      withFetch(),
      withInterceptors([jwtInterceptor])  // ensuring that interceptor runs
    )
  ]
};
