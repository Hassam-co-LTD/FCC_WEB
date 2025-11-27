import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout';

export const routes: Routes = [
    
    // Default redirect to login
    { path: '', redirectTo: 'login', 
        loadChildren:()=> {
            import("./screens/AUTH/login/login.component").then((m)=> {
                m.LoginComponent
            })
        }
    },
    // my working 
  {
  path: 'admin',
  loadComponent: () =>
    import('./screens/admin/admin').then((m) => m.AdminComponent),
  children: [
  {
    path: 'create-customer',
    loadComponent: () =>
      import('./screens/admin/pages/customers/create-customer/create-customer')
        .then((m) => m.CreateCustomer),
  }
  // no default redirect
]
,
}
,
  {
       path: "dashboard",
                loadComponent: () =>
                    import('./screens/USER/dashboard/dashboard').then((m) => m.Dashboard),
            },

            // Export Screen
            {
                path: 'export-screen',
                loadComponent: () =>
                    import('./screens/USER/export-screen/export-screen').then((m) => m.ExportScreen),
            },
 
            // ==============================
            // SHIPPING GUARANTEE
            // ==============================

            {
                path: 'shipping-guarantee',
                loadComponent: () =>
                    import('./screens/USER/shipping-guarantee-screen/shipping-guarantee-screen')
                        .then((m) => m.ShippingGuaranteeScreen),
                children: [
                    {
                        path: 'general-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/shipping-guarantee-screen/components/general-details/general-details'
                            ).then((m) => m.GeneralDetails),
                    },
                    {
                        path: 'applicant-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/shipping-guarantee-screen/components/applicant-beneficiary/applicant-beneficiary'
                            ).then((m) => m.ApplicantBeneficiary),
                    },
                    {
                        path: 'bank-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/shipping-guarantee-screen/components/bank-details/bank-details'
                            ).then((m) => m.BankDetails),
                    },
                    {
                        path: 'instructions',
                        loadComponent: () =>
                            import(
                                './screens/USER/shipping-guarantee-screen/components/instructions/instructions'
                            ).then((m) => m.InstructionsComponent),
                    },
                    {
                        path: 'attachments',
                        loadComponent: () =>
                            import(
                                './screens/USER/shipping-guarantee-screen/components/attachments/attachments'
                            ).then((m) => m.AttachmentsDocuments),
                    },
                    {
                        path: 'preview',
                        loadComponent: () =>
                            import(
                                './screens/USER/shipping-guarantee-screen/components/preview/preview'
                            ).then((m) => m.Preview),
                    }

                ],
            },

            {
                path: 'shipping-welcome',
                loadComponent: () =>
                    import('./shared/welcome-screen/welcome-screen').then(
                        (m) => m.WelcomeScreen
                    ),
                data: {
                    title: 'Welcome to Shipping Guarantee',
                    description: 'Manage all Shipping Guarantee activities here.',
                },
            },

            {
                path: 'shipping-guarantee/amend',
                loadComponent: () =>
                    import(
                        './screens/USER/shipping-guarantee-screen/components/sub-menus/events/amend/amend'
                    ).then((m) => m.Amend),
            },


            // ==============================
            // EXPORT COLLECTION
            // ==============================

            {
                path: 'export-collection',
                loadComponent: () =>
                    import('./screens/USER/export-collection/export-collection')
                        .then((m) => m.ExportCollectionComponent),
                children: [
                    {
                        path: 'general-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/export-collection/components/general-details/general-details'
                            ).then((m) => m.GeneralDetails),
                    },
                    {
                        path: 'drawer-drawee-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/export-collection/components/drawer-drawee-details/drawer-drawee-details'
                            ).then((m) => m.DrawerDraweeDetails),
                    },
                    {
                        path: 'payment-amount',
                        loadComponent: () =>
                            import(
                                './screens/USER/export-collection/components/payment-amount/payment-amount'
                            ).then((m) => m.PaymentAmountComponent),
                    },
                    {
                        path: 'bank-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/export-collection/components/bank-details/bank-details'
                            ).then((m) => m.BankDetailsComponent),
                    },
                    {
                        path: 'attachments-documents',
                        loadComponent: () =>
                            import(
                                './screens/USER/export-collection/components/attachments-documents/attachments-documents'
                            ).then((m) => m.AttachmentsDocuments),
                    },
                    {
                        path: 'collection-instructions',
                        loadComponent: () =>
                            import(
                                './screens/USER/export-collection/components/collection-instructions/collection-instructions'
                            ).then((m) => m.CollectionInstructionsComponent),
                    },
                    {
                        path: 'shipping-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/export-collection/components/shipping-details/shipping-details'
                            ).then((m) => m.ShippingDetailsComponent),
                    },
                    {
                        path: 'license',
                        loadComponent: () =>
                            import(
                                './screens/USER/export-collection/components/license/license'
                            ).then((m) => m.License),
                    },
                    {
                        path: 'preview',
                        loadComponent: () =>
                            import(
                                './screens/USER/export-collection/components/preview/preview'
                            ).then((m) => m.PreviewSectionComponent),
                    }
                ],
            },

            {
                path: 'export-welcome',
                loadComponent: () =>
                    import('./shared/welcome-screen/welcome-screen').then(
                        (m) => m.WelcomeScreen
                    ),
                data: {
                    title: 'Welcome to Export Collection',
                    description: 'Manage all Export Collection related activities here.',
                },
            },

            // ==============================
            // UNDERTAKING ISSUANCE 
            // ==============================
 
            {
                path: 'undertaking-issuance',
                loadComponent: () =>
                    import('./screens/USER/undertaking-issuance/undertaking-issuance')
                        .then((m) => m.UndertakingIssuance),
            },
 
            {
                path: 'undertaking-issuance/request-undertaking',
                loadComponent: () =>
                    import(
                        './screens/USER/undertaking-issuance/request-undertaking/request-undertaking'
                    ).then((m) => m.RequestUndertaking),
                children: [
                    {
                        path: 'general-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/undertaking-issuance/components/general-details/general-details'
                            ).then((m) => m.GeneralDetails),
                    },
                    {
                        path: 'beneficiary-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/undertaking-issuance/components/application-beneficiary/application-beneficiary'
                            ).then((m) => m.ApplicationBeneficiary),
                    },
                    {
                        path: 'bank-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/undertaking-issuance/components/bank-details/bank-details'
                            ).then((m) => m.BankDetails),
                    },
                    {
                        path: 'undertaking-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/undertaking-issuance/components/undertaking-details/undertaking-details'
                            ).then((m) => m.UndertakingDetails),
                    },
                    {
                        path: 'instruction-bank',
                        loadComponent: () =>
                            import(
                                './screens/USER/undertaking-issuance/components/instructions-bank/instructions-bank'
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
                        './screens/USER/undertaking-issuance/sub-menus/events/amend-undertaking/amend'
                    ).then((m) => m.AmendScreen),
            },
 
 
            // ==============================
            // IMPORT LC
            // ==============================
 
            {
                path: 'import-screen',
                loadComponent: () =>
                    import('./screens/USER/import-screen/import-screen').then((m) => m.ImportScreen),
                children: [
                    {
                        path: 'general-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/import-screen/components/general-details/general-details').then((m) => m.GeneralDetails),
                    },
                    {
                        path: 'applicant-beneficiary',
                        loadComponent: () =>
                            import(
                                './screens/USER/import-screen/components/applicant-beneficiary/applicant-beneficiary'
                            ).then((m) => m.ApplicantBeneficiary),
                    },
                    {
                        path: 'bank-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/import-screen/components/bank-details/bank-details'
                            ).then((m) => m.BankDetails),
                    },
                    {
                        path: 'amount-charge-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/import-screen/components/amount-charge-details/amount-charge-details'
                            ).then((m) => m.AmountChargeDetails),
                    },
                    {
                        path: 'payment-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/import-screen/components/payment-details/payment-details'
                            ).then((m) => m.PaymentDetails),
                    },
                    {
                        path: 'shipment-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/import-screen/components/shipment-details/shipment-details'
                            ).then((m) => m.ShipmentDetails),
                    },
                    {
                        path: 'narrative-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/import-screen/components/narrative-details/narrative-details'
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
        ]
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
