import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: 'login',
        loadComponent: () =>
            import('./screens/login/login.component').then((m) => m.LoginComponent),
    },
    {
        path: 'signup',
        loadComponent: () =>
            import('./screens/signup/signup.component').then((m) => m.SignupComponent),
    },
    {
        path: '',
        component: LayoutComponent,
        children:[
            { path: 'dashboard', loadComponent: () => import('./screens/dashboard/dashboard').then(m => m.Dashboard) },
            { path: 'import-screen', loadComponent: () => import('./screens/import-screen/import-screen').then(m => m.ImportScreen) },
        ]
    }
];
