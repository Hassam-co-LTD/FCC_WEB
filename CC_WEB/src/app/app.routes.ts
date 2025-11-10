import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout';

export const routes: Routes = [
    // Default redirect to login
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    // Auth routes
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

    // Layout + protected routes
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./screens/dashboard/dashboard').then((m) => m.Dashboard),
            },
            {
                path: 'export-screen',
                loadComponent: () =>
                    import('./screens/export-screen/export-screen').then(
                        (m) => m.ExportScreen
                    ),
            },

            // Import LC parent route
            {
                path: 'import-screen',
                loadComponent: () =>
                    import('./screens/import-screen/import-screen').then(
                        (m) => m.ImportScreen
                    ),
                children: [
                    {
                        path: '',
                        redirectTo: 'general-details', // Default child route when /import-screen opens
                        pathMatch: 'full',
                    },
                    {
                        path: 'general-details',
                        loadComponent: () =>
                            import(
                                './screens/import-screen/components/general-details/general-details'
                            ).then((m) => m.GeneralDetails),
                    },
                    {
                        path: 'applicant-beneficiary',
                        loadComponent: () =>
                            import(
                                './screens/import-screen/components/applicant-beneficiary/applicant-beneficiary'
                            ).then((m) => m.ApplicantBeneficiary),
                    },
                    {
                        path: 'bank-details',
                        loadComponent: () =>
                            import(
                                './screens/import-screen/components/bank-details/bank-details'
                            ).then((m) => m.BankDetails),
                    },
                    {
                        path: 'amount-charge-details',
                        loadComponent: () =>
                            import(
                                './screens/import-screen/components/amount-charge-details/amount-charge-details'
                            ).then((m) => m.AmountChargeDetails),
                    },
                    {
                        path: 'payment-details',
                        loadComponent: () =>
                            import(
                                './screens/import-screen/components/payment-details/payment-details'
                            ).then((m) => m.PaymentDetails),
                    },
                    {
                        path: 'shipment-details',
                        loadComponent: () =>
                            import(
                                './screens/import-screen/components/shipment-details/shipment-details'
                            ).then((m) => m.ShipmentDetails),
                    },
                    {
                        path: 'narrative-details',
                        loadComponent: () =>
                            import(
                                './screens/import-screen/components/narrative-details/narrative-details'
                            ).then((m) => m.NarrativeDetails),
                    },
                ],
            },

            // Default child route when logged in
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ],
    },

    // Wildcard redirect
    { path: '**', redirectTo: 'login' },
];
