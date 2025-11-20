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
      {
        path: 'shipping-guarantee-screen',
        loadComponent: () =>
          import(
            './screens/shipping-guarantee-screen/shipping-guarantee-screen'
          ).then((m) => m.shippingguaranteescreen),
        children: [
          {
            path: 'create-screen',
            loadComponent: () =>
              import(
                './screens/shipping-guarantee-screen/component/create/create'
              ).then((m) => m.CreateComponent),
          },
        ],
      },
      {
        path: 'export-collection',
        loadComponent: () =>
          import('./screens/export-collection/export-collection').then(
            (m) => m.ExportCollectionComponent
          ),
        children: [
          // { path: '', redirectTo: 'app-general-details', pathMatch: 'full' },
          {
            path: 'app-general-details',
            loadComponent: () =>
              import(
                './screens/export-collection/components/general-details/general-details'
              ).then((m) => m.GeneralDetails),
          },
          {
            path: 'drawer-drawee-details',
            loadComponent: () =>
              import(
                './screens/export-collection/components/drawer-drawee-details/drawer-drawee-details'
              ).then((m) => m.DrawerDraweeDetails),
          },
          {
            path: 'bank-details',
            loadComponent: () =>
              import(
                './screens/export-collection/components/bank-details/bank-details'
              ).then((m) => m.BankDetailsComponent),
          },
          {
            path: 'shipping-details',
            loadComponent: () =>
              import(
                './screens/export-collection/components/shipping-details/shipping-details'
              ).then((m) => m.ShippingDetails),
          },
          {
            path: 'license',
            loadComponent: () =>
              import(
                './screens/export-collection/components/license/license'
              ).then((m) => m.License),
          },
          {
            path: 'payment-amount',
            loadComponent: () =>
              import(
                './screens/export-collection/components/payment-amount/payment-amount'
              ).then((m) => m.PaymentAmount),
          },
          {
            path: 'collection-instructions',
            loadComponent: () =>
              import(
                './screens/export-collection/components/collection-instructions/collection-instructions'
              ).then((m) => m.CollectionInstructionsComponent),
          },
          {
            path: 'preview',
            loadComponent: () =>
              import(
               ( './screens/export-collection/components/preview/preview')
              ).then((m) => m.PreviewSectionComponent),
          },
        ],
      },
      {
        path: 'financial-request',
        loadComponent: () =>
          import('./screens/financing-request/financing-request').then(
            (m) => m.FinancingRequest
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
          { path: '', redirectTo: 'general-details', pathMatch: 'full' },
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
