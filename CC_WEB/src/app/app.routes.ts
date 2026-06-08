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
    // {
    //     path: 'signup',
    //     loadComponent: () =>
    //         import('./screens/AUTH/signup/signup.component').then((m) => m.SignupComponent),
    // },

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
                        path: 'create-branch',
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/branch/customer-branch/customer-branch")
                                .then((m) => m.CustomerBranch)
                    },
                    {
                        path: 'branch-list',
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/branch/branch-list/branch-list")
                                .then((m) => m.BranchList)
                    },
                    {
                        path: 'branch-inquiry',
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/branch/branch-list/branch-list")
                                .then((m) => m.BranchList)
                    },
                    {
                        path: 'edit-branch/:id',
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/branch/customer-branch/customer-branch")
                                .then((m) => m.CustomerBranch)
                    },
                    {
                        path: 'create-city',
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/city/city").then((m) => m.City)

                    },
                    {
                        path: 'edit-city/:id',
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/city/city").then((m) => m.City)
                    }
                    ,
                    {
                        path: 'city-list',
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/city/city-list/city-list").then((m) => m.CityList)

                    },
                    {
                        path: 'city/:id',
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/city/city").then((m) => m.City)

                    }
                    ,
                    {
                        path: 'city-inquiry',
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/city/city-list/city-list").then((m) => m.CityList)

                    }
                    ,
                    {
                        path: 'create-currency',
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/create-currency/create-currency").then((m) => m.CreateCurrency)

                    },
                    {
                        path: 'currency-list',
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components//create-currency/currency-list/currency-list").then((m) => m.CurrencyList)

                    },
                    {
                        path: 'create-client-user',
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/create-user-client/create-user-client").then((m) => m.CreateClientUser)

                    },
                    {
                        path: 'user-client-inquiry',
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/list-user-client/list-user-client").then((m) => m.clientUsersList)

                    },
                    {
                        path: 'edit-client-user/:id',
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/create-user-client/create-user-client").then((m) => m.CreateClientUser)
                    },

                    {
                        path: 'create-company',
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/create-company/create-company").then((m) => m.CreateCompany)

                    }
                    ,
                    {
                        path: 'company-inquiry',
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/create-company/company-list/company-list").then((m) => m.CompanyList)
                    },
                    {
                        path: 'edit-company/:id',
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/create-company/create-company").then((m) => m.CreateCompany)
                    },
                    {
                        path: 'create-role-master',
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/create-role-master/create-role-master").then((m) => m.CreateRoleMaster)
                    },
                    {
                        path: 'role-master-inquiry',
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/role-master-list/role-master-list").then((m) => m.RoleMasterList)
                    },
                    {
                        path: 'edit-role-master/:id',
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/create-role-master/create-role-master").then((m) => m.CreateRoleMaster)
                    },
                    // showing the user details roles component 
                    {
                        path: 'create-client-user/:id',
                        loadComponent: () =>
                            import("./screens/ADMIN/admin-dashboard/components/create-user-client/create-user-client").then((m) => m.CreateClientUser)
                    },


                    {
                        path: 'create-dynamic-fields',
                        loadComponent: () =>
                            import('./screens/ADMIN/admin-dashboard/components/create-generate-fields/create-generate-fields')
                                .then((m) => m.CreateGenerateFields)
                    },
                    {
                        path: 'dynamic-field-inquiry',
                        loadComponent: () =>
                            import('./screens/ADMIN/admin-dashboard/components/create-generate-fields/list-generate-fields/list-generate-fields')
                                .then((m) => m.ListGenerateFields)
                    },
                    {
                        path: 'edit-field/:id',
                        loadComponent: () =>
                            import('./screens/ADMIN/admin-dashboard/components/create-generate-fields/create-generate-fields')
                                .then((m) => m.CreateGenerateFields)

                    },
                    {
                        path: 'create-dropdown-option',
                        loadComponent: () =>
                            import('./screens/ADMIN/admin-dashboard/components/create-dropDown-option/create-dropDown-option').then((m) => m.CreateDynamicFieldOptions)
                    },
                    {

                        path: 'dynamic-dropdown-option-inquiry',
                        loadComponent: () =>
                            import('./screens/ADMIN/admin-dashboard/components/dynamic-dropdown-option-inquiry/dynamic-dropdown-option-inquiry').then((m) => m.DynamicDropdownOptionInquiry)
                    },
                    {
                        path: 'edit-dropdown-option/:id',
                        loadComponent: () =>
                            import('./screens/ADMIN/admin-dashboard/components/create-dropDown-option/create-dropDown-option').then((m) => m.CreateDynamicFieldOptions)
                    },
                    // ========Acounts========
                    {
                        path: 'create-account',
                        loadComponent: () =>
                            import('./screens/ADMIN/admin-dashboard/components/create-account/create-account').then((m) => m.Accounts)
                    },
                    {
                        path: 'Accounts-inquiry',
                        loadComponent: () =>
                            import('./screens/ADMIN/admin-dashboard/components/create-account/create-account').then((m) => m.Accounts)
                    },
                    {
                        path: 'edit-accounts/:id',
                        loadComponent: () =>
                            import('./screens/ADMIN/admin-dashboard/components/create-account/create-account').then((m) => m.Accounts)

                    }

                    // create-account-types
                    ,
                    {
                        path: 'create-account-types',
                        loadComponent: () =>
                            import('./screens/ADMIN/admin-dashboard/components/create-account-types/create-account-types').then((m) => m.CustomerAccountMaster)

                    }

                    ,
                    {
                        path: 'edit-account-types/:id',
                        loadComponent: () =>
                            import('./screens/ADMIN/admin-dashboard/components/create-account-types/create-account-types').then((m) => m.CustomerAccountMaster)

                    },
                    {
                        path: 'account-types-inquiry',
                        loadComponent: () =>
                            import('./screens/ADMIN/admin-dashboard/components/account-types-inquiry/account-types-inquiry').then((m) => m.AccountTypesInquiry)

                    }




                ],



            },

            //  CustomerUser Dashboard
            {
                path: 'customer-user',
                loadComponent: () =>
                    import('./screens/CustomerUser/create-customer/create-customer').then((m) => m.CreateCustomer),
                children: [

                    {
                        path: 'create-customer-user',
                        loadComponent: () =>
                            import('./screens/CustomerUser/Components/user-of-customer/user-of-customer').then((m) => m.UserOfCustomer),

                    },
                    {
                        path: 'edit-customer-user/:id',
                        loadComponent: () =>
                            import('./screens/CustomerUser/Components/user-of-customer/user-of-customer').then((m) => m.UserOfCustomer),
                    },
                    {

                        path: 'inquiry',
                        loadComponent: () =>
                            import('./screens/CustomerUser/Components/user-of-customer-inquiry/user-of-customer-inquiry').then((m) => m.UserOfCustomerInquiry),
                    },


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
                data: { role: 'U' },
                loadComponent: () =>
                    import('./screens/USER/Dashboard/dashboard').then((m) => m.Dashboard),
            },

            // Search Transaction ID
            {
                path: 'Search-by-id',
                loadComponent: () =>
                    import('./screens/USER/search-transaction-id/search-transaction-id').then((m) => m.SearchTransactionID),
            },
            // ==============================
            // EXPORT LC SCREEN
            // ==============================
            {
                path: 'export-screen/inquiries-records',
                loadComponent: () =>
                    import(
                        './screens/USER/Trade-Services/export-screen/sub-menus/records/inquiries-of-records/inquiries-of-records'
                    ).then((m) => m.InquiriesOfRecords),
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
            },
            // {
            //     path: 'export-screen/amend',
            //     loadComponent: () =>
            //         import('./screens/USER/Trade-Services/export-screen/sub-menus/events/amend-exportlc-event/amend')
            //             .then((m) => m.Amend),
            // },
            {
                path: 'export-screen/approved-inquiry-records',
                loadComponent: () =>
                    import(
                        './screens/USER/Trade-Services/export-screen/sub-menus/events/approved-inquiry-records/approved-inquiry-records'
                    ).then((m) => m.ApprovedInquiryRecords),
            },
            // {
            //     path: 'export-screen/amend/preview',
            //     loadComponent: () =>
            //         import('./screens/USER/Trade-Services/export-screen/sub-menus/events/amend-exportlc-event/components/preview/preview').then(m => m.PreviewSection),
            // },
            {
                path: 'export-screen/:tnxId',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/export-screen/export-screen').then(m => m.ExportScreen),
            },
            // {
            //     path: 'export-screen/amend/:tnxId',
            //     loadComponent: () =>
            //         import('./screens/USER/Trade-Services/export-screen/sub-menus/events/amend-exportlc-event/amend').then(m => m.Amend),
            // },
            {
                path: 'export-screen',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/export-screen/export-screen')
                        .then(m => m.ExportScreen)
            },
            {
                path: 'exportlc-welcome',
                loadComponent: () =>
                    import('./shared/welcome-screen/welcome-screen').then(
                        (m) => m.WelcomeScreen
                    ),
                data: {
                    title: 'Welcome to Export LC',
                    description: 'Manage all Export LC activities here.',
                    createRoute: '/export-screen',
                    templateRoute: '/export-screen?mode=template',
                    existingRoute: '/Search-by-id',
                    uploadRoute: '/export-screen?mode=upload'
                }
            },



            // ==============================
            // SHIPPING GUARANTEE
            // ==============================
            {
                path: 'shipping-guarantee/inquiries-records',
                loadComponent: () =>
                    import(
                        './screens/USER/Trade-Services/shipping-guarantee-screen/sub-menus/records/inquiries-records/inquiries-records'
                    ).then((m) => m.inquiriesRecords),
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
                path: 'shipping-guarantee/amend',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/shipping-guarantee-screen/sub-menus/events/amend-shipping-guarantee-event/amend')
                        .then((m) => m.Amend),
            },

            // Import Amend Route
            {
                path: 'shipping-guarantee/approved-inquiry-records',
                loadComponent: () =>
                    import(
                        './screens/USER/Trade-Services/shipping-guarantee-screen/sub-menus/events/approved-inquiry-records/approved-inquiry-records'
                    ).then((m) => m.ApprovedInquiryRecords),
            },

            {
                path: 'shipping-guarantee/amend/preview',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/shipping-guarantee-screen/sub-menus/events/amend-shipping-guarantee-event/components/preview/preview').then(m => m.Preview),
            },


            // Dynamic TNX ID route
            {
                path: 'shipping-guarantee/:tnxId',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/shipping-guarantee-screen/shipping-guarantee-screen').then(m => m.ShippingGuarantee),
            },
            
            {
                path: 'shipping-guarantee/amend/:tnxId',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/shipping-guarantee-screen/sub-menus/events/amend-shipping-guarantee-event/amend').then(m => m.Amend),
            },
            // Base Shipping Guarantee screen
            {
                path: 'shipping-guarantee',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/shipping-guarantee-screen/shipping-guarantee-screen')
                        .then((m) => m.ShippingGuarantee),
                data: { title: 'Shipping Guarantee' }
            },
            {
                path: 'shipping-welcome',
                loadComponent: () =>
                    import('./shared/welcome-screen/welcome-screen')
                        .then((m) => m.WelcomeScreen),
                data: {
                    title: 'Welcome to Shipping Guarantee',
                    description: 'Manage all Shipping Guarantee activities here.',
                    createRoute: '/shipping-guarantee',
                    templateRoute: '/shipping-guarantee?mode=template',
                    existingRoute: '/shipping-guarantee/inquiries-records',
                    uploadRoute: '/shipping-guarantee?mode=upload'
                }
            },
            // ==============================
            // EXPORT COLLECTION
            // ==============================
            {
                path: 'export-collection/inquiries-records',
                loadComponent: () =>
                    import(
                        './screens/USER/Trade-Services/export-collection/sub-menus/records/inquiries-of-records/inquiries-records'
                    ).then((m) => m.inquiriesRecords),
            },
            {
                path: 'export-collection/preview',
                loadComponent: () =>
                    import(
                        './screens/USER/Trade-Services/export-collection/components/preview/preview'
                    ).then((m) => m.Preview),
            },
            {
                path: 'export-collection/success',
                loadComponent: () =>
                    import('./shared/success/success')
                        .then((m) => m.Success),
                data: { title: 'Export Collection Submitted' }
            },
            {
                path: 'export-collection/amend',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/export-collection/sub-menus/events/amend-export-collection-event/amend')
                        .then((m) => m.Amend),
            },
            // Approved Amend Route
            {
                path: 'export-collection/approved-inquiry-records',
                loadComponent: () =>
                    import(
                        './screens/USER/Trade-Services/export-collection/sub-menus/events/approved-inquiry-records/approved-inquiry-records'
                    ).then((m) => m.ApprovedInquiryRecords),
            },

            {
                path: 'export-collection/amend/preview',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/export-collection/sub-menus/events/amend-export-collection-event/components/preview/preview').then(m => m.PreviewSection),
            },

            {
                path: 'export-collection/:tnxId',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/export-collection/export-collection').then(m => m.ExportCollection),
            },

            {
                path: 'export-collection/amend/:tnxId',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/export-collection/sub-menus/events/amend-export-collection-event/amend').then(m => m.Amend),
            },

            {
                path: 'export-collection',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/export-collection/export-collection')
                        .then((m) => m.ExportCollection),
                data: { title: 'Export Collection' }
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
                    createRoute: '/export-collection',
                    templateRoute: '/export-collection?mode=template',
                    existingRoute: '/export-collection/inquiries-records',
                    uploadRoute: '/export-collection?mode=upload'
                },
            },
            // ==============================
            // UNDERTAKING ISSUANCE 
            // ==============================

            {
                path: 'undertaking-issuance/inquiries-records',
                loadComponent: () =>
                    import(
                        './screens/USER/Trade-Services/undertaking-issuance/sub-menus/records/inquiries-of-records/inquiries-records'
                    ).then((m) => m.inquiriesRecords),
            },
            {
                path: 'undertaking-issuance/preview',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/undertaking-issuance/components/preview/preview').then(
                        (m) => m.Preview
                    ),
            },
            {
                path: 'undertaking-issuance/success',
                loadComponent: () => import('./shared/success/success').then(m => m.Success)
            },
            {
                path: 'undertaking-issuance/amend',
                loadComponent: () =>
                    import(
                        './screens/USER/Trade-Services/undertaking-issuance/sub-menus/events/amend-undertaking/amend'
                    ).then((m) => m.AmendScreen),
            },
            {
                path: 'undertaking-issuance/approved-inquiry-records',
                loadComponent: () =>
                    import(
                        './screens/USER/Trade-Services/undertaking-issuance/sub-menus/events/approved-inquiry-records/approved-inquiry-records'
                    ).then((m) => m.ApprovedInquiryRecords),
            },
            {
                path: 'undertaking-issuance/amend/preview',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/undertaking-issuance/sub-menus/events/amend-undertaking/components/preview/preview').then(m => m.Preview),
            },
            {
                path: 'undertaking-issuance/:tnxId',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/undertaking-issuance/request-undertaking/request-undertaking').then(m => m.RequestUndertaking),
            },

            {
                path: 'undertaking-issuance/amend/:tnxId',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/undertaking-issuance/sub-menus/events/amend-undertaking/amend').then(m => m.AmendScreen),
            },

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
                    createRoute: '/undertaking-issuance',
                    templateRoute: '/undertaking-issuance?mode=template',
                    existingRoute: '/undertaking-issuance/inquiries-records',
                    uploadRoute: '/undertaking-issuance?mode=upload'
                },
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
                    import('./screens/USER/Trade-Services/import-screen/sub-menus/events/amend-import-event/amend').then(m => m.AmendScreen),
            },

            // Import Amend Route
            {
                path: 'import-screen/approved-inquiry-records',
                loadComponent: () =>
                    import(
                        './screens/USER/Trade-Services/import-screen/sub-menus/events/approved-inquiry-records/approved-inquiry-records'
                    ).then((m) => m.ApprovedInquiryRecords),
            },

            {
                path: 'import-screen/amend/preview',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/import-screen/sub-menus/events/amend-import-event/components/preview/preview').then(m => m.Preview),
            },

            // Dynamic TNX ID route
            {
                path: 'import-screen/:tnxId',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/import-screen/import-screen').then(m => m.ImportScreen),
            },

            {
                path: 'import-screen/amend/:tnxId',
                loadComponent: () =>
                    import('./screens/USER/Trade-Services/import-screen/sub-menus/events/amend-import-event/amend').then(m => m.AmendScreen),
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
                    import('./shared/welcome-screen/welcome-screen')
                        .then((m) => m.WelcomeScreen),
                data: {
                    title: 'Welcome to Import LC',
                    description: 'Manage all Import LC related activities here.',
                    createRoute: '/import-screen',
                    templateRoute: '/import-screen?mode=template',
                    existingRoute: '/import-screen/inquiries',
                    uploadRoute: '/import-screen?mode=upload'
                }
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

            // Add this to your routes array after other USER services (after import-welcome route)

            // ==============================
            // PAYMENT SERVICES - MY ACCOUNTS
            // ==============================
            {
                path: 'my-accounts',
                children: [
                    {
                        path: '', // The main form (Create mode)
                        loadComponent: () => import('./screens/USER/Payment-Services/FundTransfer/internal-transfer/components/my-accounts/my-accounts').then(m => m.MyAccountsComponent),
                    },
                    {
                        path: 'transfer/:tnxId', // The main form (Edit/View mode)
                        loadComponent: () => import('./screens/USER/Payment-Services/FundTransfer/internal-transfer/components/my-accounts/my-accounts').then(m => m.MyAccountsComponent),
                    },
                    {
                        path: 'general-details',
                        loadComponent: () => import('./screens/USER/Payment-Services/FundTransfer/internal-transfer/components/my-accounts/components/general-details/general-details').then(m => m.GeneralDetails),
                    }
                ]
            },

            // ==============================
            // PAYMENT SERVICES - IBFT
            // ==============================
            {
                path: 'IBFT',
                children: [
                    {
                        path: '', // The main form (Create mode)
                        loadComponent: () => import('./screens/USER/Payment-Services/FundTransfer/internal-transfer/components/IBFT/IBFT').then(m => m.IBFT),
                    },
                    {
                        path: 'transfer/:tnxId', // The main form (Edit/View mode)
                        loadComponent: () => import('./screens/USER/Payment-Services/FundTransfer/internal-transfer/components/IBFT/IBFT').then(m => m.IBFT),
                    },
                    {
                        path: 'general-details',
                        loadComponent: () => import('./screens/USER/Payment-Services/FundTransfer/internal-transfer/components/IBFT/general-details/general-details').then(m => m.GeneralDetails),
                    }
                ]
            },

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