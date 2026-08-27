import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  PLATFORM_ID
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { ShippingGuaranteeTransaction } from '../../../../../../../core/models/shipping-guarantee';

import { ApiService } from '../../../../../../../core/services/api.service';

import { ShippingGuaranteeFormTransactionService } from '../../../../../../../core/services/user-service/shipping-guarantee-form-transaction-service/shipping-guarantee-form-transaction-service';

import {
  ActivatedRoute,
  Router
} from '@angular/router';


@Component({
  selector: 'app-approved-inquiry-records',

  standalone: true,

  imports: [
    CommonModule,
    MatIconModule,
    FormsModule
  ],

  templateUrl: './approved-inquiry-records.html',

  styleUrls: ['./approved-inquiry-records.scss']
})
export class ApprovedInquiryRecords implements OnInit {


  // =========================================================
  // PAGINATION
  // =========================================================

  currentPage = 1;

  itemsPerPage = 10;


  // =========================================================
  // TRANSACTIONS
  // =========================================================

  allTransactions: ShippingGuaranteeTransaction[] = [];

  filteredTransactions: ShippingGuaranteeTransaction[] = [];


  // =========================================================
  // SEARCH / FILTERS
  // =========================================================

  showAdvanced = false;

  searchQuery = '';

  currencyFilter = '';


  // =========================================================
  // TABS
  // =========================================================

  activeTab = 'live';

  tabs = [
    {
      key: 'live',
      label: 'Live'
    },
    {
      key: 'pending',
      label: 'Pending'
    },
    {
      key: 'submitted',
      label: 'Submitted'
    },
    {
      key: 'approved',
      label: 'Approved'
    },
    {
      key: 'rejected',
      label: 'Rejected'
    }
  ];


  // =========================================================
  // SORTING
  // =========================================================

  sortColumn:
    keyof ShippingGuaranteeTransaction |
    'currency' |
    'amount' |
    'expiryDate' |
    'createdOn' = 'createdOn';

  sortDirection: 'asc' | 'desc' = 'desc';


  // =========================================================
  // PLATFORM
  // =========================================================

  private readonly platformId =
    inject(PLATFORM_ID);

  private readonly isBrowser =
    isPlatformBrowser(this.platformId);


  // =========================================================
  // PERMISSIONS
  // =========================================================

  permissionGroupName = '';

  permissions: string[] = [];

  canInquiry = false;

  canAmend = false;

  canCreate = false;


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private api: ApiService,

    private transactionService:
      ShippingGuaranteeFormTransactionService,

    private router: Router,

    private route: ActivatedRoute
  ) { }


  // =========================================================
  // ON INIT
  // =========================================================

  ngOnInit(): void {

    // -------------------------------------------------------
    // BROWSER CHECK
    // -------------------------------------------------------

    if (!this.isBrowser) {
      return;
    }


    // -------------------------------------------------------
    // LOAD PERMISSIONS FIRST
    // -------------------------------------------------------

    this.loadPermissions();


    // -------------------------------------------------------
    // IF USER DOES NOT HAVE INQUIRY PERMISSION
    // DON'T LOAD RECORDS
    // -------------------------------------------------------

    if (!this.canInquiry) {

      console.warn(
        'Shipping Guarantee Inquiry permission not available'
      );

      return;
    }


    // -------------------------------------------------------
    // READ SELECTED TAB FROM URL
    // -------------------------------------------------------

    this.route.queryParamMap.subscribe(params => {

      // -----------------------------------------------------
      // PERMISSION CHECK
      // -----------------------------------------------------

      if (!this.canInquiry) {
        return;
      }


      const tab =
        params.get('tab');


      if (
        tab &&
        this.tabs.some(
          t => t.key === tab
        )
      ) {

        this.activeTab = tab;

      }


      this.currentPage = 1;


      this.loadApprovedTransactions();

    });


    // -------------------------------------------------------
    // TRANSACTION STREAM
    // -------------------------------------------------------

    this.transactionService
      .transactionsStream$
      .subscribe(txList => {

        // ---------------------------------------------------
        // PERMISSION CHECK
        // ---------------------------------------------------

        if (!this.canInquiry) {

          this.allTransactions = [];

          this.filteredTransactions = [];

          return;
        }


        this.allTransactions =
          txList;


        this.applyFilters();

      });

  }


  // =========================================================
  // PERMISSION LOADING
  // =========================================================

  private loadPermissions(): void {

    if (!this.isBrowser) {
      return;
    }


    // -------------------------------------------------------
    // PERMISSION GROUP
    // -------------------------------------------------------

    this.permissionGroupName =
      sessionStorage.getItem(
        'permissionGroupName'
      ) || '';


    // -------------------------------------------------------
    // PERMISSION JSON
    // -------------------------------------------------------

    const permissionJson =
      sessionStorage.getItem(
        'permissions'
      );


    console.log(
      'Shipping Guarantee Permission Group:',
      this.permissionGroupName
    );


    console.log(
      'Shipping Guarantee Permission JSON:',
      permissionJson
    );


    // -------------------------------------------------------
    // RESET
    // -------------------------------------------------------

    this.permissions = [];

    this.canInquiry = false;

    this.canAmend = false;

    this.canCreate = false;


    // -------------------------------------------------------
    // PARSE PERMISSIONS
    // -------------------------------------------------------

    if (permissionJson) {

      try {

        const parsedPermissions =
          JSON.parse(permissionJson);


        if (
          Array.isArray(
            parsedPermissions
          )
        ) {

          this.permissions =
            parsedPermissions;

        } else {

          this.permissions = [];

        }

      } catch (error) {

        console.error(
          'Error parsing permissions:',
          error
        );

        this.permissions = [];

      }

    }


    // =======================================================
    // SHIPPING GUARANTEE GROUP
    // =======================================================

    const isShippingGuarantee =
      this.permissionGroupName ===
      'Shipping_Guarantee';


    // =======================================================
    // INQUIRY
    // =======================================================

    this.canInquiry =
      isShippingGuarantee &&
      this.permissions.includes(
        'Inquiry'
      );


    // =======================================================
    // AMEND
    // =======================================================

    this.canAmend =
      isShippingGuarantee &&
      this.permissions.includes(
        'Amend'
      );


    // =======================================================
    // CREATE
    // =======================================================

    this.canCreate =
      isShippingGuarantee &&
      this.permissions.includes(
        'Create'
      );


    // =======================================================
    // DEBUG
    // =======================================================

    console.log(
      '========== SHIPPING GUARANTEE PERMISSIONS =========='
    );


    console.log(
      'Permission Group:',
      this.permissionGroupName
    );


    console.log(
      'Permissions:',
      this.permissions
    );


    console.log(
      'Can Inquiry:',
      this.canInquiry
    );


    console.log(
      'Can Amend:',
      this.canAmend
    );


    console.log(
      'Can Create:',
      this.canCreate
    );


    console.log(
      '===================================================='
    );

  }


  // =========================================================
  // PERMISSION HELPER
  // =========================================================

  hasPermission(
    permission: string
  ): boolean {

    if (!this.isBrowser) {
      return false;
    }


    return (
      this.permissionGroupName ===
      'Shipping_Guarantee'
      &&
      this.permissions.includes(
        permission
      )
    );

  }


  // =========================================================
  // LOAD TRANSACTIONS
  // =========================================================

  private loadApprovedTransactions(): void {

    // -------------------------------------------------------
    // INQUIRY PERMISSION
    // -------------------------------------------------------

    if (!this.canInquiry) {

      console.warn(
        'Cannot load Shipping Guarantee records: Inquiry permission missing'
      );

      this.allTransactions = [];

      this.filteredTransactions = [];

      return;
    }


    // -------------------------------------------------------
    // LIVE TAB
    // -------------------------------------------------------

    if (
      this.activeTab === 'live'
    ) {

      this.api
        .getApprovedMasterSgRecords()
        .subscribe({

          next: (txList) => {

            this.allTransactions =
              txList;

            this.applyFilters();

          },


          error: (error) => {

            console.error(
              'Error loading live Shipping Guarantee records:',
              error
            );

            this.allTransactions = [];

            this.filteredTransactions = [];

          }

        });


      return;

    }


    // -------------------------------------------------------
    // OTHER TABS
    // -------------------------------------------------------

    const backendStatus =
      this.mapTabToBackendStatus(
        this.activeTab
      );


    this.api
      .getAmendRecordTransactionsByStatusSg(
        backendStatus
      )
      .subscribe({

        next: (txList) => {

          this.allTransactions =
            txList;

          this.applyFilters();

        },


        error: (error) => {

          console.error(
            'Error loading Shipping Guarantee records:',
            error
          );

          this.allTransactions = [];

          this.filteredTransactions = [];

        }

      });

  }


  // =========================================================
  // PAGINATION
  // =========================================================

  get totalPages(): number {

    if (!this.canInquiry) {
      return 1;
    }


    const count =
      Math.ceil(
        this.filteredTransactions.length /
        this.itemsPerPage
      );


    return count < 1
      ? 1
      : count;

  }


  get pagedTransactions():
    ShippingGuaranteeTransaction[] {

    if (!this.canInquiry) {
      return [];
    }


    const start =
      (this.currentPage - 1) *
      this.itemsPerPage;


    return this.filteredTransactions.slice(
      start,
      start + this.itemsPerPage
    );

  }


  // =========================================================
  // PREVIOUS PAGE
  // =========================================================

  previousPage(): void {

    // -------------------------------------------------------
    // PERMISSION CHECK
    // -------------------------------------------------------

    if (!this.canInquiry) {

      console.warn(
        'Cannot paginate: Inquiry permission missing'
      );

      return;
    }


    if (
      this.currentPage > 1
    ) {

      this.currentPage--;

    }

  }


  // =========================================================
  // NEXT PAGE
  // =========================================================

  nextPage(): void {

    // -------------------------------------------------------
    // PERMISSION CHECK
    // -------------------------------------------------------

    if (!this.canInquiry) {

      console.warn(
        'Cannot paginate: Inquiry permission missing'
      );

      return;
    }


    if (
      this.currentPage <
      this.totalPages
    ) {

      this.currentPage++;

    }

  }


  // =========================================================
  // SEARCH / FILTER
  // =========================================================

  applyFilters(): void {

    // -------------------------------------------------------
    // PERMISSION CHECK
    // -------------------------------------------------------

    if (!this.canInquiry) {

      this.filteredTransactions = [];

      return;
    }


    const query =
      this.searchQuery
        .toLowerCase()
        .trim();


    const currency =
      this.currencyFilter
        .toLowerCase()
        .trim();


    const filtered =
      this.allTransactions.filter(
        tx => {

          const matchesSearch =
            !query ||
            tx.tnxId
              ?.toLowerCase()
              .includes(query) ||
            tx.beneficiaryName
              ?.toLowerCase()
              .includes(query) ||
            tx.currency
              ?.toLowerCase()
              .includes(query);


          const matchesCurrency =
            !currency ||
            tx.currency
              ?.toLowerCase() ===
              currency;


          return (
            matchesSearch &&
            matchesCurrency
          );

        }
      );


    this.applySorting(
      filtered
    );

  }


  // =========================================================
  // CLEAR SEARCH
  // =========================================================

  clearSearch(): void {

    // -------------------------------------------------------
    // PERMISSION CHECK
    // -------------------------------------------------------

    if (!this.canInquiry) {

      return;
    }


    this.searchQuery = '';

    this.applyFilters();

  }


  // =========================================================
  // SORTING
  // =========================================================

  private applySorting(
    source:
      ShippingGuaranteeTransaction[] =
      this.allTransactions
  ): void {

    // -------------------------------------------------------
    // PERMISSION CHECK
    // -------------------------------------------------------

    if (!this.canInquiry) {

      this.filteredTransactions = [];

      return;
    }


    const sorted =
      [...source].sort(
        (a, b) => {

          const aVal =
            this.resolveColumn(
              a,
              this.sortColumn
            );


          const bVal =
            this.resolveColumn(
              b,
              this.sortColumn
            );


          // -------------------------------------------------
          // NULL / UNDEFINED
          // -------------------------------------------------

          if (aVal == null) {
            return 1;
          }


          if (bVal == null) {
            return -1;
          }


          // -------------------------------------------------
          // DATES
          // -------------------------------------------------

          if (
            aVal instanceof Date &&
            bVal instanceof Date
          ) {

            return this.sortDirection === 'asc'
              ? aVal.getTime() -
                bVal.getTime()
              : bVal.getTime() -
                aVal.getTime();

          }


          // -------------------------------------------------
          // NUMBERS
          // -------------------------------------------------

          if (
            typeof aVal === 'number' &&
            typeof bVal === 'number'
          ) {

            return this.sortDirection === 'asc'
              ? aVal - bVal
              : bVal - aVal;

          }


          // -------------------------------------------------
          // STRINGS
          // -------------------------------------------------

          const aStr =
            String(aVal);

          const bStr =
            String(bVal);


          return this.sortDirection === 'asc'
            ? aStr.localeCompare(
                bStr
              )
            : bStr.localeCompare(
                aStr
              );

        }
      );


    this.filteredTransactions =
      sorted;


    this.currentPage = 1;

  }


  // =========================================================
  // RESOLVE SORT COLUMN
  // =========================================================

  private resolveColumn(
    tx: ShippingGuaranteeTransaction,
    column: string
  ): any {

    switch (column) {

      case 'tnxId':
        return tx.tnxId;

      case 'currency':
        return tx.currency;

      case 'amount':
        return tx.amount;

      case 'expiryDate':
        return tx.expiryDate;

      case 'createdOn':
        return tx.createdOn;

      default:
        return null;

    }

  }


  // =========================================================
  // SET ACTIVE TAB
  // =========================================================

  setActiveTab(
    tab: string
  ): void {

    // -------------------------------------------------------
    // INQUIRY PERMISSION
    // -------------------------------------------------------

    if (!this.canInquiry) {

      console.warn(
        'Cannot change tab: Inquiry permission missing'
      );

      return;
    }


    // -------------------------------------------------------
    // VALID TAB
    // -------------------------------------------------------

    const validTab =
      this.tabs.some(
        t => t.key === tab
      );


    if (!validTab) {

      console.warn(
        'Invalid Shipping Guarantee tab:',
        tab
      );

      return;
    }


    // -------------------------------------------------------
    // SAME TAB
    // -------------------------------------------------------

    if (
      this.activeTab === tab
    ) {

      return;
    }


    // -------------------------------------------------------
    // CHANGE TAB
    // -------------------------------------------------------

    this.activeTab =
      tab;


    this.currentPage =
      1;


    this.loadApprovedTransactions();

  }


  // =========================================================
  // SORT BUTTON
  // =========================================================

  toggleSort(
    column:
      keyof ShippingGuaranteeTransaction
  ): void {

    // -------------------------------------------------------
    // INQUIRY PERMISSION
    // -------------------------------------------------------

    if (!this.canInquiry) {

      console.warn(
        'Cannot sort: Inquiry permission missing'
      );

      return;
    }


    // -------------------------------------------------------
    // SAME COLUMN
    // -------------------------------------------------------

    if (
      this.sortColumn === column
    ) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    }


    // -------------------------------------------------------
    // NEW COLUMN
    // -------------------------------------------------------

    else {

      this.sortColumn =
        column;

      this.sortDirection =
        'asc';

    }


    this.applySort();

  }


  // =========================================================
  // APPLY SORT
  // =========================================================

  private applySort(): void {

    // -------------------------------------------------------
    // INQUIRY PERMISSION
    // -------------------------------------------------------

    if (!this.canInquiry) {

      this.filteredTransactions = [];

      return;
    }


    const dir =
      this.sortDirection === 'asc'
        ? 1
        : -1;


    this.filteredTransactions.sort(
      (a, b) => {

        const va: any =
          a[this.sortColumn] ?? '';


        const vb: any =
          b[this.sortColumn] ?? '';


        if (va < vb) {

          return -1 * dir;

        }


        if (va > vb) {

          return 1 * dir;

        }


        return 0;

      }
    );

  }


  // =========================================================
  // VIEW TRANSACTION
  // =========================================================

  viewTransaction(
    tx: ShippingGuaranteeTransaction
  ): void {

    // -------------------------------------------------------
    // INQUIRY PERMISSION
    // -------------------------------------------------------

    if (!this.canInquiry) {

      console.warn(
        'User does not have Shipping Guarantee Inquiry permission'
      );

      return;
    }


    // -------------------------------------------------------
    // TRANSACTION CHECK
    // -------------------------------------------------------

    if (!tx?.tnxId) {

      console.warn(
        'Transaction ID is missing'
      );

      return;
    }


    const readOnly =
      ['A', 'R'].includes(
        tx.status!
      );


    // -------------------------------------------------------
    // GET FRESH TRANSACTION
    // -------------------------------------------------------

    this.api
      .getAmendmentByTnxIdSg(
        tx.tnxId
      )
      .subscribe({

        next: (freshTx) => {

          this.transactionService
            .setCurrentTransaction(
              freshTx,
              readOnly
            );


          this.router.navigate([
            '/dashboard/Trade-Services/shipping-guarantee/amend/preview'
          ]);

        },


        error: (error) => {

          console.error(
            'Error loading transaction:',
            error
          );


          // -------------------------------------------------
          // FALLBACK TO CURRENT TRANSACTION
          // -------------------------------------------------

          this.transactionService
            .setCurrentTransaction(
              tx,
              readOnly
            );


          this.router.navigate([
            '/dashboard/Trade-Services/shipping-guarantee/amend/preview'
          ]);

        }

      });

  }


  // =========================================================
  // OPEN AMENDMENT TRANSACTION
  // =========================================================

  openApprovedAmendTransactionSG(
    tx: ShippingGuaranteeTransaction
  ): void {

    // -------------------------------------------------------
    // AMEND PERMISSION
    // -------------------------------------------------------

    if (!this.canAmend) {

      console.warn(
        'User does not have Shipping Guarantee Amend permission'
      );

      return;
    }


    // -------------------------------------------------------
    // TRANSACTION CHECK
    // -------------------------------------------------------

    if (!tx?.tnxId) {

      console.warn(
        'Transaction ID is missing'
      );

      return;
    }


    // -------------------------------------------------------
    // NAVIGATE TO AMENDMENT
    // -------------------------------------------------------

    this.router.navigate(
      [
        '/dashboard/Trade-Services/shipping-guarantee/amend',
        tx.tnxId
      ],
      {
        queryParams: {

          mode: 'EDIT',

          tab:
            this.activeTab,

          eventType:
            this.activeTab === 'live'
              ? 'AMD'
              : (
                  tx.eventType ??
                  'AMD'
                ),

          ...(this.activeTab !== 'live' && {

            eventRefNo:
              tx.eventRefNo ??
              ''

          })

        }

      }
    );

  }


  // =========================================================
  // TRACK BY
  // =========================================================

  trackByTnxId(
    _: number,
    tx: ShippingGuaranteeTransaction
  ): string {

    return tx.tnxId ?? '';

  }


  // =========================================================
  // STATUS MAPPING
  // =========================================================

  private mapTabToBackendStatus(
    tab: string
  ): string {

    switch (tab) {

      case 'pending':
        return 'i';

      case 'submitted':
        return 's';

      case 'approved':
        return 'a';

      case 'rejected':
        return 'r';

      default:
        return 'i';

    }

  }

}