import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout';
import { authGuard } from './core/guards/auth-guard';
import { ImportScreen } from './screens/USER/import-screen/import-screen';

export const routes: Routes = [
    // Default redirect
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    // Auth routes
    {
        path: 'login',
        loadComponent: () =>
            import('./screens/AUTH/login/login.component').then((m) => m.LoginComponent),
    },
    {
        path: 'signup',
        loadComponent: () =>
            import('./screens/AUTH/signup/signup.component').then((m) => m.SignupComponent),
    },

    // Protected routes (with layout)
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            // Admin-Dashboard
            // my routes 

           {
                path: "admin",
                loadComponent: () =>
                    import("./screens/ADMIN/admin-dashboard/admin-dashboard").then((m) => m.AdminComponent),
                children: [
                    {
                        path: "create-customer",
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/customers/create-customer/create-customer")
                                .then((m) => m.CreateCustomer),
                    },
                    {
                        path: "users",
                        loadComponent: () =>
                            import('./screens/ADMIN/admin-dashboard/components/users/users').then((m) => m.Users)
                    }
                    ,
                    {
                        path: "customer-list",
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/customers/customer-list/customer-list").then((m) => m.CustomerList)
                    },
                    {
                        path: "create-customer/:id",
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/customers/create-customer/create-customer")
                                .then((m) => m.CreateCustomer),
                    },
                    
                {
                    path:'create-branch',
                    loadComponent : ()=> 
                        import("./screens/ADMIN/admin-dashboard/components/branch/customer-branch/customer-branch")
                        .then((m)=> m.CustomerBranch)
                    },
                    {
                    path:'branch-list',
                    loadComponent : ()=> 
                        import("./screens/ADMIN/admin-dashboard/components/branch/branch-list/branch-list")
                        .then((m)=> m.BranchList)
                    },
                    {
                    path:'branch-inquiry',
                    loadComponent : ()=> 
                        import("./screens/ADMIN/admin-dashboard/components/branch/branch-list/branch-list")
                        .then((m)=> m.BranchList)
                    },
                     {
                    path:'create-branch/:id',
                    loadComponent : ()=> 
                        import("./screens/ADMIN/admin-dashboard/components/branch/customer-branch/customer-branch")
                        .then((m)=> m.CustomerBranch)
                    },
                    
                    
                
                ],
    
                
            }
            ,


            // ==============================
            // System overview
            // ==============================
            {
                path: 'system-overview',
                loadComponent: () =>
                    import('./screens/ADMIN/system-overview/system-overview').then((m) => m.SystemOverview),
            },


            // ==============================
            // Middle-Office
            // ==============================
            {
                path: 'middle-office',
                loadComponent: () =>
                    import('./screens/ADMIN/middle-office/middle-office').then((m) => m.MiddleOffice),
            },


            // Dashboard
            {
                path: 'dashboard',
                canActivate: [authGuard],
                data: { role: 'USER' },
                loadComponent: () =>
                    import('./screens/USER/dashboard/dashboard').then((m) => m.Dashboard),
            },

            // Search Transaction ID
            {
                path: 'Search-by-id',
                loadComponent: () =>
                    import('./screens/USER/search-transaction-id/search-transaction-id').then((m) => m.SearchTransactionID),
            },
            // Export Screen
            {
                path: 'export-screen',
                loadComponent: () =>
                    import('./screens/USER/export-screen/export-screen')
                        .then(m => m.ExportScreen)
            },
            {
                path: 'export-screen/preview',
                loadComponent: () =>
                    import('./screens/USER/export-screen/components/preview/preview')
                        .then(m => m.ExportPreview)
            },
            {
                path: 'export-screen/success',
                loadComponent: () =>
                    import('./shared/success/success')
                        .then(m => m.Success)
            }
            ,

            {
                path: 'exportlc-welcome',
                loadComponent: () =>
                    import('./shared/welcome-screen/welcome-screen').then(
                        (m) => m.WelcomeScreen
                    ),
                data: {
                    title: 'Welcome to Export LC',
                    description: 'Manage all Export LC activities here.',
                },
            },



            // ==============================
            // SHIPPING GUARANTEE
            // ==============================

            {
                path: 'shipping-guarantee',
                loadComponent: () =>
                    import('./screens/USER/shipping-guarantee-screen/shipping-guarantee-screen')
                        .then((m) => m.ShippingGuarantee),
                data: { title: 'Shipping Guarantee' }
            },
            {
                path: 'shipping-guarantee/preview',
                loadComponent: () =>
                    import('./screens/USER/shipping-guarantee-screen/components/preview/preview')
                        .then((m) => m.Preview),
                data: { title: 'Preview Shipping Guarantee' }
            },
            {
                path: 'shipping-guarantee/success',
                loadComponent: () =>
                    import('./shared/success/success')
                        .then((m) => m.Success),
                data: { title: 'Shipping Guarantee Submitted' }
            },
            {
                path: 'shipping-welcome',
                loadComponent: () =>
                    import('./shared/welcome-screen/welcome-screen')
                        .then((m) => m.WelcomeScreen),
                data: {
                    title: 'Welcome to Shipping Guarantee',
                    description: 'Manage all Shipping Guarantee activities here.'
                }
            },
            {
                path: 'shipping-guarantee/amend',
                loadComponent: () =>
                    import('./screens/USER/shipping-guarantee-screen/components/sub-menus/events/amend/amend')
                        .then((m) => m.Amend),
                data: { title: 'Amend Shipping Guarantee' }
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
                ],
            },
            {
                path: 'export-collection/preview',
                loadComponent: () =>
                    import(
                        './screens/USER/export-collection/components/preview/preview'
                    ).then((m) => m.PreviewSectionComponent),
            },
            {
                path: 'export-collection-welcome',
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
                    import('./screens/USER//undertaking-issuance/undertaking-issuance')
                        .then((m) => m.UndertakingIssuance),
            },

            {
                path: 'undertaking-issuance/request-undertaking',
                loadComponent: () =>
                    import(
                        './screens/USER//undertaking-issuance/request-undertaking/request-undertaking'
                    ).then((m) => m.RequestUndertaking),
                children: [
                    {
                        path: 'general-details',
                        loadComponent: () =>
                            import(
                                './screens/USER//undertaking-issuance/components/general-details/general-details'
                            ).then((m) => m.generalDetails),
                    },
                    {
                        path: 'beneficiary-details',
                        loadComponent: () =>
                            import(
                                './screens/USER//undertaking-issuance/components/application-beneficiary/application-beneficiary'
                            ).then((m) => m.ApplicationBeneficiary),
                    },
                    {
                        path: 'bank-details',
                        loadComponent: () =>
                            import(
                                './screens/USER//undertaking-issuance/components/bank-details/bank-details'
                            ).then((m) => m.BankDetails),
                    },
                    {
                        path: 'undertaking-details',
                        loadComponent: () =>
                            import(
                                './screens/USER//undertaking-issuance/components/undertaking-details/undertaking-details'
                            ).then((m) => m.UndertakingDetails),
                    },
                    {
                        path: 'instruction-bank',
                        loadComponent: () =>
                            import(
                                './screens/USER//undertaking-issuance/components/instructions-bank/instructions-bank'
                            ).then((m) => m.InstructionsBank),
                    },

                ],
            },

            {
                path: 'undertaking-issuance/preview',
                loadComponent: () =>
                    import('./screens/USER/undertaking-issuance/components/preview/preview').then(
                        (m) => m.Preview
                    ),

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
                        './screens/USER//undertaking-issuance/sub-menus/events/amend-undertaking/amend'
                    ).then((m) => m.AmendScreen),
            },


            // ==============================
            // IMPORT LC
            // ==============================

            // Static routes first
            {
                path: 'import-screen/enquiries',
                loadComponent: () =>
                    import('./screens/USER/import-screen/sub-menus/records/enquiries-of-records/enquiries-of-records')
                        .then(m => m.EnquiriesOfRecords),
            },
            {
                path: 'import-screen/preview',
                loadComponent: () =>
                    import('./screens/USER/import-screen/components/preview/preview').then(m => m.Preview),
            },
            {
                path: 'import-screen/success',
                loadComponent: () =>
                    import('./shared/success/success').then(m => m.Success),
            },
            {
                path: 'import-screen/amend',
                loadComponent: () =>
                    import('./screens/USER/import-screen/sub-menus/events/amend-import/amend').then(m => m.AmendScreen),
            },

            // Dynamic TNX ID route
            {
                path: 'import-screen/:tnxId',
                loadComponent: () =>
                    import('./screens/USER/import-screen/import-screen').then(m => m.ImportScreen),
            },

            // Base import screen
            {
                path: 'import-screen',
                loadComponent: () =>
                    import('./screens/USER/import-screen/import-screen').then(m => m.ImportScreen),
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
            // Default child redirect
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ],
    },

    // Wildcard redirect
    { path: '**', redirectTo: 'login' },
];