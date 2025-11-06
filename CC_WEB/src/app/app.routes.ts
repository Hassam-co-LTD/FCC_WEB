import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'export', pathMatch: 'full' },
  {
    path: 'export',
    loadComponent: () =>
      import('./screens/export-screen/export-screen').then(m => m.ExportScreenComponent),
  },
];
