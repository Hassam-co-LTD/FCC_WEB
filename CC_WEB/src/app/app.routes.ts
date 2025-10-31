import { Routes } from '@angular/router';

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
    { path: 'import-screen', loadComponent: () => import('./screens/import-screen/import-screen').then(m => m.ImportScreen) },


    { path: '**', redirectTo: 'login' }
];
