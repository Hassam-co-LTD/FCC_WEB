import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  // Default redirect
  { path: '', redirectTo: 'shipping-guarantee', pathMatch: 'full' },

  // Shipping Guarantee Screen
  {
    path: 'shipping-guarantee',
    loadComponent: () =>
      import('./screens/shipping-guarantee-screen/shipping-guarantee-screen')
        .then(m => m.ShippingGuarantee),
  },

  // Future routes (extend here)
  {
    path: 'export',
    loadComponent: () =>
      import('./screens/export-screen/export-screen')
        .then(m => m.ExportScreenComponent),
  },

  // Wildcard route (404 fallback)
  { path: '**', redirectTo: 'shipping-guarantee' },
];
