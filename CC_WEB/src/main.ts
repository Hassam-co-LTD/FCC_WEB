import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { appRoutes } from './app/app.routes';

console.log('🗺️ Registered routes:', appRoutes);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));