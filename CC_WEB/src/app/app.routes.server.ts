import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Public pages have no user-specific data and are safe to prerender
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'customer-registration', renderMode: RenderMode.Prerender },

  // Everything else depends on the session held in the browser's
  // sessionStorage, which the server can never see. Rendering those pages on
  // the server only produced "sessionStorage is not defined" errors, so they
  // are rendered in the browser.
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
