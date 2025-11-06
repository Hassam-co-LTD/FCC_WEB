import { Routes } from '@angular/router';
import { ExportScreenComponent } from './screens/export-screen/export-screen';
export const appRoutes: Routes = [
  { path: '', redirectTo: 'export', pathMatch: 'full' },
  {
    path: 'export',
    loadComponent: () =>
      import('./screens/export-screen/export-screen').then(m => m.ExportScreenComponent),
  },
];
