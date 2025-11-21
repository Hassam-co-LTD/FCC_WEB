import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout';

export const routes: Routes = [
    
    // Default redirect to login
    { path: '', redirectTo: 'signup', pathMatch: 'full' },
    // my working 
   {
        path: 'admin',
        loadComponent: () =>
            import('./screens/admin/admin').then((m) => m.AdminComponent),
    },


    // Auth routes
    {
        path: 'login',
        loadComponent: () =>
            import('./screens/login/login.component').then((m) => m.LoginComponent),
    },
    { 
        path: 'signup',
        loadComponent: () =>
            import('./screens/admin-login/admin-login').then((m) => 
             m.AdminLogin),
    },

    // Protected routes (with layout)
    {
        path: '',
        component: LayoutComponent,
        children: [
            // Dashboard
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./screens/dashboard/dashboard').then((m) => m.Dashboard),
            },

            // Export Screen
            {
                path: 'export-screen',
                loadComponent: () =>
                    import('./screens/export-screen/export-screen').then((m) => m.ExportScreen),
            },

            // Import LC Parent Route
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

            // 🆕 Import Amend Route
            {
                path: 'import-screen/amend',
                loadComponent: () =>
                    import(
                        './screens/import-screen/sub-menus/events/amend/amend'
                    ).then((m) => m.AmendScreen),
            },

            // Default child route (dashboard)
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ],
    },

    // Wildcard redirect
    { path: '**', redirectTo: 'login' },
];

// import { Routes } from '@angular/router';
// import { LayoutComponent } from './core/layout/layout';

// export const routes: Routes = [
//     // Default redirect to login
//     { path: '', redirectTo: 'login', pathMatch: 'full' },

//     // Auth routes
//     {
//         path: 'login',
//         loadComponent: () =>
//             import('./screens/login/login.component').then((m) => m.LoginComponent),
//     },
//     {
//         path: 'signup',
//         loadComponent: () =>
//             import('./screens/signup/signup.component').then((m) => m.SignupComponent),
//     },

//     // Layout + protected routes
//     {
//         path: '',
//         component: LayoutComponent,
//         children: [
//             {
//                 path: 'dashboard',
//                 loadComponent: () =>
//                     import('./screens/dashboard/dashboard').then((m) => m.Dashboard),
//             },
//             {
//                 path: 'export-screen',
//                 loadComponent: () =>
//                     import('./screens/export-screen/export-screen').then(
//                         (m) => m.ExportScreen
//                     ),
//             },

//             // Import LC parent route
//             {
//                 path: 'import-screen',
//                 loadComponent: () =>
//                     import('./screens/import-screen/import-screen').then(
//                         (m) => m.ImportScreen
//                     ),
//                 children: [
//                     {
//                         path: '',
//                         redirectTo: 'general-details', // Default child route when /import-screen opens
//                         pathMatch: 'full',
//                     },
//                     {
//                         path: 'import-welcome',
//                         loadComponent: () =>
//                             import('./shared/welcome-screen/welcome-screen').then(
//                                 (m) => m.WelcomeScreen
//                             ),
//                         data: {
//                             title: 'Welcome to Import LC',
//                             description: 'Manage all Import LC related activities here.',
//                         },
//                     },
//                     {
//                         path: 'general-details',
//                         loadComponent: () =>
//                             import(
//                                 './screens/import-screen/components/general-details/general-details'
//                             ).then((m) => m.GeneralDetails),
//                     },
//                     {
//                         path: 'applicant-beneficiary',
//                         loadComponent: () =>
//                             import(
//                                 './screens/import-screen/components/applicant-beneficiary/applicant-beneficiary'
//                             ).then((m) => m.ApplicantBeneficiary),
//                     },
//                     {
//                         path: 'bank-details',
//                         loadComponent: () =>
//                             import(
//                                 './screens/import-screen/components/bank-details/bank-details'
//                             ).then((m) => m.BankDetails),
//                     },
//                     {
//                         path: 'amount-charge-details',
//                         loadComponent: () =>
//                             import(
//                                 './screens/import-screen/components/amount-charge-details/amount-charge-details'
//                             ).then((m) => m.AmountChargeDetails),
//                     },
//                     {
//                         path: 'payment-details',
//                         loadComponent: () =>
//                             import(
//                                 './screens/import-screen/components/payment-details/payment-details'
//                             ).then((m) => m.PaymentDetails),
//                     },
//                     {
//                         path: 'shipment-details',
//                         loadComponent: () =>
//                             import(
//                                 './screens/import-screen/components/shipment-details/shipment-details'
//                             ).then((m) => m.ShipmentDetails),
//                     },
//                     {
//                         path: 'narrative-details',
//                         loadComponent: () =>
//                             import(
//                                 './screens/import-screen/components/narrative-details/narrative-details'
//                             ).then((m) => m.NarrativeDetails),
//                     },
//                 ],
//             },


//             {
//                 path: 'import-screen/amend',
//                 loadComponent: () =>
//                     import('./screens/import-screen/sub-menus/events/amend/amend').then(
//                         (m) => m.AmendScreen
//                     ),
//             },

//             // Default child route when logged in
//             { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
//         ],
//     },

//     // Wildcard redirect
//     { path: '**', redirectTo: 'login' },
// ];
