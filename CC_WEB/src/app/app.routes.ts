import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    // Default redirect
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

    // Protected routes (with layout)
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            // Admin-Dashboard
            {
                path: 'admin',
                canActivate: [authGuard],
                data: { role: 'ADMIN' },
                loadComponent: () =>
                    import('./screens/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
            },
            // Dashboard
            {
                path: 'dashboard',
                canActivate: [authGuard],
                data: { role: 'USER' },
                loadComponent: () =>
                    import('./screens/dashboard/dashboard').then((m) => m.Dashboard),
            },

            // Export Screen
            {
                path: 'export-screen',
                loadComponent: () =>
                    import('./screens/export-screen/export-screen').then((m) => m.ExportScreen),
            },

            // ==============================
            // UNDERTAKING ISSUANCE (FIXED)
            // ==============================

            {
                path: 'undertaking-issuance',
                loadComponent: () =>
                    import('./screens/undertaking-issuance/undertaking-issuance')
                        .then((m) => m.UndertakingIssuance),
            },

            {
                path: 'undertaking-issuance/request-undertaking',
                loadComponent: () =>
                    import(
                        './screens/undertaking-issuance/request-undertaking/request-undertaking'
                    ).then((m) => m.RequestUndertaking),
                children: [
                    {
                        path: 'general-details',
                        loadComponent: () =>
                            import(
                                './screens/undertaking-issuance/components/general-details/general-details'
                            ).then((m) => m.GeneralDetails),
                    },
                    {
                        path: 'beneficiary-details',
                        loadComponent: () =>
                            import(
                                './screens/undertaking-issuance/components/application-beneficiary/application-beneficiary'
                            ).then((m) => m.ApplicationBeneficiary),
                    },
                    {
                        path: 'bank-details',
                        loadComponent: () =>
                            import(
                                './screens/undertaking-issuance/components/bank-details/bank-details'
                            ).then((m) => m.BankDetails),
                    },
                    {
                        path: 'undertaking-details',
                        loadComponent: () =>
                            import(
                                './screens/undertaking-issuance/components/undertaking-details/undertaking-details'
                            ).then((m) => m.UndertakingDetails),
                    },
                    {
                        path: 'instruction-bank',
                        loadComponent: () =>
                            import(
                                './screens/undertaking-issuance/components/instructions-bank/instructions-bank'
                            ).then((m) => m.InstructionsBank),
                    },
                ],
            },

            {
                path: 'undertaking-welcome',
                loadComponent: () =>
                    import('./shared/welcome-screen/welcome-screen').then(
                        (m) => m.WelcomeScreen
                    ),
                data: {
                    title: 'Welcome to Undertaking Issuance',
                    description:
                        'Manage all Undertaking Issuance related activities here.',
                },
            },

            {
                path: 'undertaking-issuance/amend',
                loadComponent: () =>
                    import(
                        './screens/undertaking-issuance/amend-import/amend'
                    ).then((m) => m.AmendScreen),
            },


            // ==============================
            // IMPORT LC
            // ==============================

            {
                path: 'import-screen',
                loadComponent: () =>
                    import('./screens/import-screen/import-screen').then((m) => m.ImportScreen),
                children: [
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

            {
                path: 'import-welcome',
                loadComponent: () =>
                    import('./shared/welcome-screen/welcome-screen').then(
                        (m) => m.WelcomeScreen
                    ),
                data: {
                    title: 'Welcome to Import LC',
                    description: 'Manage all Import LC related activities here.',
                },
            },

            // Import Amend Route
            {
                path: 'import-screen/amend',
                loadComponent: () =>
                    import(
                        './screens/import-screen/sub-menus/events/amend-import/amend'
                    ).then((m) => m.AmendScreen),
            },

            // Default child redirect
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ],
    },

    // Wildcard redirect
    { path: '**', redirectTo: 'login' },
];
