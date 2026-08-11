import { Routes, UrlMatcher, UrlSegment } from '@angular/router';
import { LayoutComponent } from './core/layout/layout';
import { authGuard } from './core/guards/auth-guard';

export const transactionIdMatcher: UrlMatcher = (segments: UrlSegment[]) => {
  if (
    segments.length === 2 &&
    segments[0].path === 'import-screen' &&
    /^\d+$/.test(segments[1].path)
  ) {
    return {
      consumed: segments,
    };
  }

  return null;
};

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Auth routes
  {
    path: 'login',
    loadComponent: () =>
      import('./screens/AUTH/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./screens/AUTH/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },

  // Protected routes (with layout)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'admin',
        canActivate: [authGuard],
        canActivateChild: [authGuard],
        data: {
          role: 'A',
          companyType: 'C',
        },
        loadComponent: () =>
          import('./screens/ADMIN/admin-dashboard/admin-dashboard').then(
            (m) => m.AdminComponent,
          ),
        children: [
          {
            path: 'create-customer',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/customers/create-customer/create-customer').then(
                (m) => m.CreateCustomer,
              ),
          },
          {
            path: 'users',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/users/users').then(
                (m) => m.Users,
              ),
          },
          {
            path: 'customer-list',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/customers/customer-list/customer-list').then(
                (m) => m.CustomerList,
              ),
          },
          {
            path: 'create-customer/:id',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/customers/create-customer/create-customer').then(
                (m) => m.CreateCustomer,
              ),
          },
          {
            path: 'create-branch',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/branch/customer-branch/customer-branch').then(
                (m) => m.CustomerBranch,
              ),
          },
          {
            path: 'branch-list',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/branch/branch-list/branch-list').then(
                (m) => m.BranchList,
              ),
          },
          {
            path: 'branch-inquiry',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/branch/branch-list/branch-list').then(
                (m) => m.BranchList,
              ),
          },
          {
            path: 'edit-branch/:id',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/branch/customer-branch/customer-branch').then(
                (m) => m.CustomerBranch,
              ),
          },
          {
            path: 'create-city',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/city/city').then(
                (m) => m.City,
              ),
          },
          {
            path: 'edit-city/:id',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/city/city').then(
                (m) => m.City,
              ),
          },
          {
            path: 'city-list',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/city/city-list/city-list').then(
                (m) => m.CityList,
              ),
          },
          {
            path: 'city/:id',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/city/city').then(
                (m) => m.City,
              ),
          },
          {
            path: 'city-inquiry',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/city/city-list/city-list').then(
                (m) => m.CityList,
              ),
          },
          {
            path: 'create-currency',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/create-currency/create-currency').then(
                (m) => m.CreateCurrency,
              ),
          },
          {
            path: 'currency-list',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components//create-currency/currency-list/currency-list').then(
                (m) => m.CurrencyList,
              ),
          },
          {
            path: 'create-client-user',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/create-user-client/create-user-client').then(
                (m) => m.CreateClientUser,
              ),
          },
          {
            path: 'user-client-inquiry',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/list-user-client/list-user-client').then(
                (m) => m.clientUsersList,
              ),
          },
          {
            path: 'edit-client-user/:id',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/create-user-client/create-user-client').then(
                (m) => m.CreateClientUser,
              ),
          },
          {
            path: 'create-company',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/create-company/create-company').then(
                (m) => m.CreateCompany,
              ),
          },
          {
            path: 'company-inquiry',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/create-company/company-list/company-list').then(
                (m) => m.CompanyList,
              ),
          },
          {
            path: 'edit-company/:id',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/create-company/create-company').then(
                (m) => m.CreateCompany,
              ),
          },
          {
            path: 'create-role-master',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/create-role-master/create-role-master').then(
                (m) => m.CreateRoleMaster,
              ),
          },
          {
            path: 'role-master-inquiry',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/role-master-list/role-master-list').then(
                (m) => m.RoleMasterList,
              ),
          },
          {
            path: 'edit-role-master/:id',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/create-role-master/create-role-master').then(
                (m) => m.CreateRoleMaster,
              ),
          },
          {
            path: 'create-client-user/:id',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/create-user-client/create-user-client').then(
                (m) => m.CreateClientUser,
              ),
          },
          {
            path: 'create-dynamic-fields',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/create-generate-fields/create-generate-fields').then(
                (m) => m.CreateGenerateFields,
              ),
          },
          {
            path: 'dynamic-field-inquiry',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/create-generate-fields/list-generate-fields/list-generate-fields').then(
                (m) => m.ListGenerateFields,
              ),
          },
          {
            path: 'edit-field/:id',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/create-generate-fields/create-generate-fields').then(
                (m) => m.CreateGenerateFields,
              ),
          },
          {
            path: 'create-dropdown-option',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/create-dropDown-option/create-dropDown-option').then(
                (m) => m.CreateDynamicFieldOptions,
              ),
          },
          {
            path: 'dynamic-dropdown-option-inquiry',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/dynamic-dropdown-option-inquiry/dynamic-dropdown-option-inquiry').then(
                (m) => m.DynamicDropdownOptionInquiry,
              ),
          },
          {
            path: 'edit-dropdown-option/:id',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/create-dropDown-option/create-dropDown-option').then(
                (m) => m.CreateDynamicFieldOptions,
              ),
          },
          // ========Accounts========
          {
            path: 'create-account',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/create-account/create-account').then(
                (m) => m.Accounts,
              ),
          },
          {
            path: 'Accounts-inquiry',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/create-account/create-account').then(
                (m) => m.Accounts,
              ),
          },
          {
            path: 'edit-accounts/:id',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/create-account/create-account').then(
                (m) => m.Accounts,
              ),
          },
          {
            path: 'create-account-types',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/create-account-types/create-account-types').then(
                (m) => m.CreateAccountTypes,
              ),
          },
          {
            path: 'edit-account-types/:id',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/create-account-types/create-account-types').then(
                (m) => m.CreateAccountTypes,
              ),
          },
          {
            path: 'account-types-inquiry',
            loadComponent: () =>
              import('./screens/ADMIN/admin-dashboard/components/account-types-inquiry/account-types-inquiry').then(
                (m) => m.AccountTypesInquiry,
              ),
          },
          // ================= Permission Master =================
          {
            path: 'create-permission',
            loadComponent: () =>
              import('./screens/admin/admin-dashboard/components/permission-master/permission-master').then(
                (m) => m.PermissionMaster,
              ),
          },
          {
            path: 'edit-permission/:id',
            loadComponent: () =>
              import('./screens/admin/admin-dashboard/components/permission-master/permission-master').then(
                (m) => m.PermissionMaster,
              ),
          },
          {
            path: 'permission-master-inquiry',
            loadComponent: () =>
              import('./screens/admin/admin-dashboard/components/permissions-inquiry/permissions-inquiry').then(
                (m) => m.RoleMasterList,
              ),
          },
        ],
      },

      //  CustomerUser Dashboard
      {
        path: 'customer-user',
        canActivate: [authGuard],
        canActivateChild: [authGuard],
        data: { companyType: 'B' },
        loadComponent: () =>
          import('./screens/CustomerUser/create-customer/create-customer').then(
            (m) => m.CreateCustomer,
          ),
        children: [
          {
            path: 'create-customer-user',
            loadComponent: () =>
              import('./screens/CustomerUser/Components/user-of-customer/user-of-customer').then(
                (m) => m.UserOfCustomer,
              ),
          },
          {
            path: 'edit-customer-user/:id',
            loadComponent: () =>
              import('./screens/CustomerUser/Components/user-of-customer/user-of-customer').then(
                (m) => m.UserOfCustomer,
              ),
          },
          {
            path: 'inquiry',
            loadComponent: () =>
              import('./screens/CustomerUser/Components/user-of-customer-inquiry/user-of-customer-inquiry').then(
                (m) => m.UserOfCustomerInquiry,
              ),
          },
        ],
      },

      {
        path: 'system-overview',
        canActivate: [authGuard],
        data: { role: 'A', companyType: 'C' },
        loadComponent: () =>
          import('./screens/ADMIN/system-overview/system-overview').then(
            (m) => m.SystemOverview,
          ),
      },
      {
        path: 'middle-office',
        canActivate: [authGuard],
        data: { role: 'A', companyType: 'C' },
        loadComponent: () =>
          import('./screens/ADMIN/middle-office/middle-office').then(
            (m) => m.MiddleOffice,
          ),
      },

      {
        path: 'dashboard',
        canActivate: [authGuard],
        canActivateChild: [authGuard],
        data: { role: 'U', companyType: 'C' },
        loadComponent: () =>
          import('./screens/USER/Dashboard/dashboard').then((m) => m.Dashboard),
        children: [
          // { path: '', redirectTo: 'Trade-Services', pathMatch: 'full' },

          {
            path: 'search-by-id',
            loadComponent: () =>
              import('./screens/USER/search-transaction-id/search-transaction-id').then(
                (m) => m.SearchTransactionID,
              ),
          },

          // ==============================
          // TRADE SERVICES — Import LC, Export LC, Shipping Guarantee,
          // Export Collection, Undertaking Issuance ONLY
          // ==============================
          {
            path: 'Trade-Services',
            loadComponent: () =>
              import('./screens/USER/Trade-Services/Trade-Services').then(
                (m) => m.TradeServices,
              ),
            children: [
              // ---------- EXPORT LC ----------
              {
                path: 'export-screen/inquiries',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/export-screen/sub-menus/records/inquiries-of-records/inquiries-of-records').then(
                    (m) => m.InquiriesOfRecords,
                  ),
              },
              {
                path: 'export-screen/preview',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/export-screen/components/preview/preview').then(
                    (m) => m.ExportPreview,
                  ),
              },
              {
                path: 'export-screen/success',
                loadComponent: () =>
                  import('./shared/success/success').then((m) => m.Success),
              },
              {
                matcher: transactionIdMatcher,

                loadComponent: () =>
                  import('./screens/USER/Trade-Services/export-screen/export-screen').then(
                    (m) => m.ExportScreen,
                  ),
              },
              {
                path: 'export-screen',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/export-screen/export-screen').then(
                    (m) => m.ExportScreen,
                  ),
              },
              {
                path: 'exportlc-welcome',
                loadComponent: () =>
                  import('./shared/welcome-screen/welcome-screen').then(
                    (m) => m.WelcomeScreen,
                  ),
                data: {
                  title: 'Welcome to Export LC',
                  description: 'Manage all Export LC activities here.',
                  createRoute: '/dashboard/Trade-Services/export-screen',
                  templateRoute:
                    '/dashboard/Trade-Services/export-screen?mode=template',
                  existingRoute:
                    '/dashboard/Trade-Services/export-screen/inquiries',
                  uploadRoute:
                    '/dashboard/Trade-Services/export-screen?mode=upload',
                },
              },

              // ---------- SHIPPING GUARANTEE ----------
              {
                path: 'shipping-guarantee/inquiries-records',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/shipping-guarantee-screen/sub-menus/records/inquiries-records/inquiries-records').then(
                    (m) => m.inquiriesRecords,
                  ),
              },
              {
                path: 'shipping-guarantee/preview',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/shipping-guarantee-screen/components/preview/preview').then(
                    (m) => m.Preview,
                  ),
              },
              {
                path: 'shipping-guarantee/success',
                loadComponent: () =>
                  import('./shared/success/success').then((m) => m.Success),
              },
              {
                path: 'shipping-guarantee/amend',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/shipping-guarantee-screen/sub-menus/events/amend-shipping-guarantee-event/amend').then(
                    (m) => m.Amend,
                  ),
              },
              {
                path: 'shipping-guarantee/approved-inquiry-records',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/shipping-guarantee-screen/sub-menus/events/approved-inquiry-records/approved-inquiry-records').then(
                    (m) => m.ApprovedInquiryRecords,
                  ),
              },
              {
                path: 'shipping-guarantee/amend/preview',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/shipping-guarantee-screen/sub-menus/events/amend-shipping-guarantee-event/components/preview/preview').then(
                    (m) => m.Preview,
                  ),
              },
              {
                path: 'shipping-guarantee/:tnxId',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/shipping-guarantee-screen/shipping-guarantee-screen').then(
                    (m) => m.ShippingGuarantee,
                  ),
              },
              {
                matcher: transactionIdMatcher,
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/shipping-guarantee-screen/shipping-guarantee-screen').then(
                    (m) => m.ShippingGuarantee,
                  ),
              },
              {
                path: 'shipping-guarantee/amend/:tnxId',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/shipping-guarantee-screen/sub-menus/events/amend-shipping-guarantee-event/amend').then(
                    (m) => m.Amend,
                  ),
              },
              {
                path: 'shipping-guarantee',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/shipping-guarantee-screen/shipping-guarantee-screen').then(
                    (m) => m.ShippingGuarantee,
                  ),
              },
              {
                path: 'shipping-welcome',
                loadComponent: () =>
                  import('./shared/welcome-screen/welcome-screen').then(
                    (m) => m.WelcomeScreen,
                  ),
                data: {
                  title: 'Welcome to Shipping Guarantee',
                  description: 'Manage all Shipping Guarantee activities here.',
                  createRoute: '/dashboard/Trade-Services/shipping-guarantee',
                  templateRoute:
                    '/dashboard/Trade-Services/shipping-guarantee?mode=template',
                  existingRoute:
                    '/dashboard/Trade-Services/shipping-guarantee/inquiries-records',
                  uploadRoute:
                    '/dashboard/Trade-Services/shipping-guarantee?mode=upload',
                },
              },

              // ---------- EXPORT COLLECTION ----------
              {
                path: 'export-collection/preview',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/export-collection/components/preview/preview').then(
                    (m) => m.Preview,
                  ),
              },
              {
                path: 'export-collection/success',
                loadComponent: () =>
                  import('./shared/success/success').then((m) => m.Success),
                data: { title: 'Export Collection Submitted' },
              },
              {
                matcher: transactionIdMatcher,
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/export-collection/export-collection').then(
                    (m) => m.ExportCollection,
                  ),
              },
              {
                path: 'export-collection',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/export-collection/export-collection').then(
                    (m) => m.ExportCollection,
                  ),
                data: { title: 'Export Collection' },
              },
              {
                path: 'export-collection-welcome',
                loadComponent: () =>
                  import('./shared/welcome-screen/welcome-screen').then(
                    (m) => m.WelcomeScreen,
                  ),
                data: {
                  title: 'Welcome to Export Collection',
                  description:
                    'Manage all Export Collection related activities here.',
                  createRoute: '/dashboard/Trade-Services/export-collection',
                  templateRoute:
                    '/dashboard/Trade-Services/export-collection?mode=template',
                  existingRoute:
                    '/dashboard/Trade-Services/export-collection/inquiries-records',
                  uploadRoute:
                    '/dashboard/Trade-Services/export-collection?mode=upload',
                },
              },

              // ---------- UNDERTAKING ISSUANCE ----------
              {
                path: 'undertaking-issuance/inquiries-records',
                pathMatch: 'full',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/undertaking-issuance/sub-menus/records/inquiries-of-records/inquiries-records').then(
                    (m) => m.inquiriesRecords,
                  ),
              },
              {
                path: 'undertaking-issuance/preview',
                pathMatch: 'full',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/undertaking-issuance/components/preview/preview').then(
                    (m) => m.Preview,
                  ),
              },
              {
                path: 'undertaking-issuance/success',
                pathMatch: 'full',
                loadComponent: () =>
                  import('./shared/success/success').then((m) => m.Success),
              },
              {
                path: 'undertaking-issuance/amend',
                pathMatch: 'full',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/undertaking-issuance/sub-menus/events/amend-undertaking/amend').then(
                    (m) => m.AmendScreen,
                  ),
              },
              {
                path: 'undertaking-issuance/approved-inquiry-records',
                pathMatch: 'full',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/undertaking-issuance/sub-menus/events/approved-inquiry-records/approved-inquiry-records').then(
                    (m) => m.ApprovedInquiryRecords,
                  ),
              },
              {
                path: 'undertaking-issuance/amend/preview',
                pathMatch: 'full',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/undertaking-issuance/sub-menus/events/amend-undertaking/components/preview/preview').then(
                    (m) => m.Preview,
                  ),
              },
              {
                path: 'undertaking-issuance/:tnxId',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/undertaking-issuance/undertaking-issuance').then(
                    (m) => m.UndertakingIssuance,
                  ),
              },
              {
                matcher: transactionIdMatcher,
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/undertaking-issuance/undertaking-issuance').then(
                    (m) => m.UndertakingIssuance,
                  ),
              },
              {
                path: 'undertaking-issuance/amend/:tnxId',
                pathMatch: 'full',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/undertaking-issuance/sub-menus/events/amend-undertaking/amend').then(
                    (m) => m.AmendScreen,
                  ),
              },
              {
                path: 'undertaking-issuance',
                pathMatch: 'full',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/undertaking-issuance/undertaking-issuance').then(
                    (m) => m.UndertakingIssuance,
                  ),
              },
              {
                path: 'undertaking-welcome',
                pathMatch: 'full',
                loadComponent: () =>
                  import('./shared/welcome-screen/welcome-screen').then(
                    (m) => m.WelcomeScreen,
                  ),
                data: {
                  title: 'Welcome to Undertaking Issuance',
                  description:
                    'Manage all Undertaking Issuance related activities here.',
                  createRoute: '/dashboard/Trade-Services/undertaking-issuance',
                  templateRoute:
                    '/dashboard/Trade-Services/undertaking-issuance?mode=template',
                  existingRoute:
                    '/dashboard/Trade-Services/undertaking-issuance/inquiries-records',
                  uploadRoute:
                    '/dashboard/Trade-Services/undertaking-issuance?mode=upload',
                },
              },

              // ---------- IMPORT LC ----------
              {
                path: 'import-screen/inquiries',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/import-screen/sub-menus/records/enquiries-of-records/enquiries-of-records').then(
                    (m) => m.EnquiriesOfRecords,
                  ),
              },
              {
                path: 'import-screen/preview',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/import-screen/components/preview/preview').then(
                    (m) => m.Preview,
                  ),
              },
              {
                path: 'import-screen/success',
                loadComponent: () =>
                  import('./shared/success/success').then((m) => m.Success),
              },
              {
                path: 'import-screen/amend',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/import-screen/sub-menus/events/amend-import-event/amend').then(
                    (m) => m.AmendScreen,
                  ),
              },
              {
                path: 'import-screen/approved-inquiry-records',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/import-screen/sub-menus/events/approved-inquiry-records/approved-inquiry-records').then(
                    (m) => m.ApprovedInquiryRecords,
                  ),
              },
              {
                path: 'import-screen/amend/preview',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/import-screen/sub-menus/events/amend-import-event/components/preview/preview').then(
                    (m) => m.Preview,
                  ),
              },
              {
                path: 'import-screen/:tnxId',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/import-screen/import-screen').then(
                    (m) => m.ImportScreen,
                  ),
              },
              {
                matcher: transactionIdMatcher,
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/import-screen/import-screen').then(
                    (m) => m.ImportScreen,
                  ),
              },
              {
                path: 'import-screen/amend/:tnxId',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/import-screen/sub-menus/events/amend-import-event/amend').then(
                    (m) => m.AmendScreen,
                  ),
              },
              {
                path: 'import-screen',
                loadComponent: () =>
                  import('./screens/USER/Trade-Services/import-screen/import-screen').then(
                    (m) => m.ImportScreen,
                  ),
              },
              {
                path: 'import-welcome',
                loadComponent: () =>
                  import('./shared/welcome-screen/welcome-screen').then(
                    (m) => m.WelcomeScreen,
                  ),
                data: {
                  title: 'Welcome to Import LC',
                  description: 'Manage all Import LC related activities here.',
                  createRoute: '/dashboard/Trade-Services/import-screen',
                  templateRoute:
                    '/dashboard/Trade-Services/import-screen?mode=template',
                  existingRoute:
                    '/dashboard/Trade-Services/import-screen/inquiries',
                  uploadRoute:
                    '/dashboard/Trade-Services/import-screen?mode=upload',
                },
              },
            ],
          },

          // ==============================
          // PAYMENT SERVICES — sibling of Trade Services, not nested inside it
          // ==============================
          {
            path: 'my-accounts',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./screens/USER/Payment-Services/FundTransfer/internal-transfer/components/my-accounts/my-accounts').then(
                    (m) => m.MyAccountsComponent,
                  ),
              },
              {
                path: 'transfer/:tnxId',
                loadComponent: () =>
                  import('./screens/USER/Payment-Services/FundTransfer/internal-transfer/components/my-accounts/my-accounts').then(
                    (m) => m.MyAccountsComponent,
                  ),
              },
              {
                path: 'general-details',
                loadComponent: () =>
                  import('./screens/USER/Payment-Services/FundTransfer/internal-transfer/components/my-accounts/components/general-details/general-details').then(
                    (m) => m.GeneralDetails,
                  ),
              },
            ],
          },
          {
            path: 'IBFT',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./screens/USER/Payment-Services/FundTransfer/internal-transfer/components/IBFT/IBFT').then(
                    (m) => m.IBFT,
                  ),
              },
              {
                path: 'transfer/:tnxId',
                loadComponent: () =>
                  import('./screens/USER/Payment-Services/FundTransfer/internal-transfer/components/IBFT/IBFT').then(
                    (m) => m.IBFT,
                  ),
              },
              {
                path: 'general-details',
                loadComponent: () =>
                  import('./screens/USER/Payment-Services/FundTransfer/internal-transfer/components/IBFT/general-details/general-details').then(
                    (m) => m.GeneralDetails,
                  ),
              },
            ],
          },
          {
            path: 'fund-transfer-welcome',
            loadComponent: () =>
              import('./shared/welcome-screen/welcome-screen').then(
                (m) => m.WelcomeScreen,
              ),
            data: {
              title: 'Welcome to Fund Transfer',
              description: 'Manage all activities related FUND TRANSFER here.',
            },
          },
          {
            path: 'fund-transfer/with-in',
            loadComponent: () =>
              import('./screens/USER/Payment-Services/FundTransfer/third-party-transfer/third-party-transfer').then(
                (m) => m.ThirdPartyTransfer,
              ),
          },
          {
            path: 'fund-transfer/ibft',
            loadComponent: () =>
              import('./screens/USER/Payment-Services/FundTransfer/third-party-transfer/third-party-transfer').then(
                (m) => m.ThirdPartyTransfer,
              ),
          },
          {
            path: 'fund-transfer/fund-transfer-records',
            loadComponent: () =>
              import('./screens/USER/Payment-Services/FundTransfer/sub-menus/records/inquiry-of-fundtransfer-records/inquiry-of-fundtransfer-records').then(
                (m) => m.InquiryOfFundtransferRecords,
              ),
          },
        ],
      },

      // Default child redirect for '/'
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./screens/AUTH/page-not-found/page-not-found').then(
        (m) => m.PageNotFound,
      ),
  },
];
