import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideNativeDateAdapter } from '@angular/material/core';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
// import { provideSweetAlert2 } from '@sweetalert2/ngx-sweetalert2';
export const appConfig: ApplicationConfig = {
  providers: [
    provideNativeDateAdapter(),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    // importProvidersFrom(HttpClientModule)
    provideHttpClient(withFetch()) ,
      //  provideSweetAlert2(), 
  ]
};
