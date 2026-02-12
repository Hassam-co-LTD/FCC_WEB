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
                    , {
                        path: "showCustomerDetails",
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/customers/show-customers-form-data/show-customers-form-data").then((m) => m.ShowCustomersFormData)
                    }
                ]
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
                    import('./screens/USER/Dashboard/dashboard').then((m) => m.Dashboard),
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
                    import('./screens/USER/Trade-Services/export-screen/export-screen')
                        .then(m => m.ExportScreen)
            },
            {
                path: 'export-screen/preview',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/export-screen/components/preview/preview')
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
                    import('./screens/USER/Trade-Services/shipping-guarantee-screen/shipping-guarantee-screen')
                        .then((m) => m.ShippingGuarantee),
                data: { title: 'Shipping Guarantee' }
            },
            {
                path: 'shipping-guarantee/preview',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/shipping-guarantee-screen/components/preview/preview')
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
                path: 'shipping-guarantee/inquiries-records',
                loadComponent: () =>
                    import(
                        './screens/USER/Trade-Services/shipping-guarantee-screen/sub-menus/records/inquiries-records'
                    ).then((m) => m.inquiriesRecords),
            },
            {
                path: 'shipping-guarantee/amend',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/shipping-guarantee-screen/sub-menus/events/amend/amend')
                        .then((m) => m.Amend),
                data: { title: 'Amend Shipping Guarantee' }
            },

            // ==============================
            // EXPORT COLLECTION
            // ==============================

            {
                path: 'export-collection',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/export-collection/export-collection')
                        .then((m) => m.ExportCollectionComponent),
                children: [
                    {
                        path: 'general-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/Trade-Services/export-collection/components/general-details/general-details'
                            ).then((m) => m.GeneralDetails),
                    },
                    {
                        path: 'drawer-drawee-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/Trade-Services/export-collection/components/drawer-drawee-details/drawer-drawee-details'
                            ).then((m) => m.DrawerDraweeDetails),
                    },
                    {
                        path: 'payment-amount',
                        loadComponent: () =>
                            import(
                                './screens/USER/Trade-Services/export-collection/components/payment-amount/payment-amount'
                            ).then((m) => m.PaymentAmountComponent),
                    },
                    {
                        path: 'bank-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/Trade-Services/export-collection/components/bank-details/bank-details'
                            ).then((m) => m.BankDetailsComponent),
                    },
                    {
                        path: 'attachments-documents',
                        loadComponent: () =>
                            import(
                                './screens/USER/Trade-Services/export-collection/components/attachments-documents/attachments-documents'
                            ).then((m) => m.AttachmentsDocuments),
                    },
                    {
                        path: 'collection-instructions',
                        loadComponent: () =>
                            import(
                                './screens/USER/Trade-Services/export-collection/components/collection-instructions/collection-instructions'
                            ).then((m) => m.CollectionInstructionsComponent),
                    },
                    {
                        path: 'shipping-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/Trade-Services/export-collection/components/shipping-details/shipping-details'
                            ).then((m) => m.ShippingDetailsComponent),
                    },
                    {
                        path: 'license',
                        loadComponent: () =>
                            import(
                                './screens/USER/Trade-Services/export-collection/components/license/license'
                            ).then((m) => m.License),
                    },
                ],
            },
            {
                path: 'export-collection/preview',
                loadComponent: () =>
                    import(
                        './screens/USER/Trade-Services/export-collection/components/preview/preview'
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
                    import('./screens/USER/Trade-Services/undertaking-issuance/undertaking-issuance')
                        .then((m) => m.UndertakingIssuance),
            },

            {
                path: 'undertaking-issuance/request-undertaking',
                loadComponent: () =>
                    import(
                        './screens/USER/Trade-Services/undertaking-issuance/request-undertaking/request-undertaking'
                    ).then((m) => m.RequestUndertaking),
                children: [
                    {
                        path: 'general-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/Trade-Services/undertaking-issuance/components/general-details/general-details'
                            ).then((m) => m.generalDetails),
                    },
                    {
                        path: 'beneficiary-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/Trade-Services/undertaking-issuance/components/application-beneficiary/application-beneficiary'
                            ).then((m) => m.ApplicationBeneficiary),
                    },
                    {
                        path: 'bank-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/Trade-Services/undertaking-issuance/components/bank-details/bank-details'
                            ).then((m) => m.BankDetails),
                    },
                    {
                        path: 'undertaking-details',
                        loadComponent: () =>
                            import(
                                './screens/USER/Trade-Services/undertaking-issuance/components/undertaking-details/undertaking-details'
                            ).then((m) => m.UndertakingDetails),
                    },
                    {
                        path: 'instruction-bank',
                        loadComponent: () =>
                            import(
                                './screens/USER/Trade-Services/undertaking-issuance/components/instructions-bank/instructions-bank'
                            ).then((m) => m.InstructionsBank),
                    },

                ],
            },

            {
                path: 'undertaking-issuance/preview',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/undertaking-issuance/components/preview/preview').then(
                        (m) => m.Preview
                    ),

            },

            {
                path: 'undertaking-issuance/inquiries-records',
                loadComponent: () =>
                    import(
                        './screens/USER/Trade-Services/undertaking-issuance/sub-menus/events/records/inquiries-records'
                    ).then((m) => m.inquiriesRecords),
            },
            {
                path: 'undertaking-issuance/success',
                loadComponent: () => import('./shared/success/success').then(m => m.Success)
            },
            // Submitted-Records Route
            // {
            //     path: 'undertaking-issuance/submitted-records',
            //     loadComponent: () =>
            //         import(
            //             './screens/USER/undertaking-issuance/sub-menus/events/submitted-records/submitted-records'
            //         ).then((m) => m.SubmittedRecordsComponent),
            // },
            // Approved-Records Route
            //             {
            //     path: 'undertaking-issuance/approved-records',
            //     loadComponent: () =>
            //         import(
            //             './screens/USER/undertaking-issuance/sub-menus/events/appoved-records/appoved-records'
            //         ).then((m) => m.AppovedRecords),
            // },
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
                        './screens/USER/Trade-Services/undertaking-issuance/sub-menus/events/amend-undertaking/amend'
                    ).then((m) => m.AmendScreen),
            },


            // ==============================
            // IMPORT LC
            // ==============================

            // Static routes first
            {
                path: 'import-screen/inquiries',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/import-screen/sub-menus/records/enquiries-of-records/enquiries-of-records')
                        .then(m => m.EnquiriesOfRecords),
            },
            {
                path: 'import-screen/preview',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/import-screen/components/preview/preview').then(m => m.Preview),
            },
            {
                path: 'import-screen/success',
                loadComponent: () =>
                    import('./shared/success/success').then(m => m.Success),
            },
            {
                path: 'import-screen/amend',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/import-screen/sub-menus/events/amend-import/amend').then(m => m.AmendScreen),
            },

            // Dynamic TNX ID route
            {
                path: 'import-screen/:tnxId',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/import-screen/import-screen').then(m => m.ImportScreen),
            },

            // Base import screen
            {
                path: 'import-screen',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/import-screen/import-screen').then(m => m.ImportScreen),
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
                        './screens/USER/Trade-Services/import-screen/sub-menus/events/amend-import/amend'
                    ).then((m) => m.AmendScreen),
            },

            // Import Pending-Records Route
            {
                path: 'import-screen/pending-records',
                loadComponent: () =>
                    import(
                        './screens/USER/Trade-Services/import-screen/sub-menus/records/enquiries-of-records/enquiries-of-records'
                    ).then((m) => m.EnquiriesOfRecords),
            },

            // Import submitted-Records Route

            // Import approved-Records Route
            // {
            //     path: 'import-screen/approved-records',
            //     loadComponent: () =>
            //         import(
            //             './screens/USER/import-screen/sub-menus/records/approved-records/approved-records'
            //         ).then((m) => m.ApprovedRecords),
            // },


            // Payment Services -> Fund Transfer -> with-in bank (3rd party bank)
            // Base fund-transfer screen
            {
                path: 'fund-transfer-welcome',
                loadComponent: () =>
                    import('./shared/welcome-screen/welcome-screen').then(
                        (m) => m.WelcomeScreen
                    ),
                data: {
                    title: 'Welcome to Fund Transfer',
                    description: 'Manage all activities related FUND TRANSFER here.',
                },
            },

            // fund-transfer with-in-bank (3rd party) Route
            {
                path: 'fund-transfer/with-in',
                loadComponent: () =>
                    import(
                        './screens/USER/Payment-Services/FundTransfer/third-party-transfer/third-party-transfer'
                    ).then((m) => m.ThirdPartyTransfer),
            },
            // fund-transfer IBFT Route
            {
                path: 'fund-transfer/ibft',
                loadComponent: () =>
                    import(
                        './screens/USER/Payment-Services/FundTransfer/third-party-transfer/third-party-transfer'
                    ).then((m) => m.ThirdPartyTransfer),
            },
            // Import Fund-Records Route
            {
                path: 'fund-transfer/fund-transfer-records',
                loadComponent: () =>
                    import(
                        './screens/USER/Payment-Services/FundTransfer/sub-menus/records/inquiry-of-fundtransfer-records/inquiry-of-fundtransfer-records'
                    ).then((m) => m.InquiryOfFundtransferRecords),
            },

            // Default child redirect
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ],
    },

    // Wildcard redirect
    { path: '**', redirectTo: 'login' },
];