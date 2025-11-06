import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';
import { appRoutes } from './app/app.routes';

console.log('🗺️ Registered routes:', appRoutes);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));