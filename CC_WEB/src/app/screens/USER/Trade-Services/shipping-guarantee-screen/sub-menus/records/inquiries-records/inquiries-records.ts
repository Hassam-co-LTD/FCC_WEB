import { Component, PLATFORM_ID, OnInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { finalize, delay } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// SERVICES
import {
  ExportDropdown,
  ExportFormat,
} from '../../../../../../../shared/export-dropdown/export-dropdown';
import { ShippingGuaranteeTransaction } from '../../../../../../../core/models/shipping-guarantee';
import { ApiService } from '../../../../../../../core/services/api.service';
import { ShippingGuaranteeFormTransactionService } from '../../../../../../../core/services/user-service/shipping-guarantee-form-transaction-service/shipping-guarantee-form-transaction-service';

@Component({
  selector: 'app-inquiries-records',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    ExportDropdown
  ],
  templateUrl: './inquiries-records.html',
  styleUrls: ['./inquiries-records.scss'],
})
export class inquiriesRecords implements OnInit {
  isLoading = false;
  hasLoadedData = false;
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  // State
  allTransactions: ShippingGuaranteeTransaction[] = [];
  filteredTransactions: ShippingGuaranteeTransaction[] = [];

  // Filters
  showAdvanced = false;
  searchQuery = '';
  currencyFilter = '';
  activeTab = 'pending';

  // Tabs Configuration
  tabs = [
    { key: 'live', label: 'Live' },
    { key: 'pending', label: 'Pending' }, // Drafts (Input)
    { key: 'submitted', label: 'Submitted' }, // Checker (Approve/Reject)
    { key: 'approved', label: 'Approved' }, // Final (View Only)
    { key: 'rejected', label: 'Rejected' }, // Correction (Edit)
  ];

  permissionNames: string[] = [];

  hasPermission(permission: string): boolean {
    return this.permissionNames.some(
      (p) => p?.trim().toLowerCase() === permission.trim().toLowerCase(),
    );
  }

  // Sorting
  sortColumn:
    | keyof ShippingGuaranteeTransaction
    | 'currency'
    | 'amount'
    | 'expiryDate'
    | 'createdOn' = 'createdOn';
  sortDirection: 'asc' | 'desc' = 'desc';

  // =========================================================
  // PLATFORM
  // =========================================================

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser =
    isPlatformBrowser(this.platformId);

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private api: ApiService,
    private transactionService: ShippingGuaranteeFormTransactionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  // CHECK PERMISSION
  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.loadPermissions();
    console.log('Shipping Guarantee Permissions:', this.permissionNames);
    this.route.queryParamMap.subscribe((params) => {
      const tab = params.get('tab');
      if (tab && this.tabs.some((t) => t.key === tab)) {
        this.activeTab = tab;
      }

      this.hasLoadedData = false;
      this.allTransactions = [];
      this.filteredTransactions = [];
      // this.currentPage = 1;
      // this.loadTransactions();
    });

    // this.transactionService.transactionsStream$.subscribe((txList) => {
    //   this.allTransactions = txList;
    //   this.applyFilters();
  }

  private loadPermissions(): void {
    const storedPermissions = sessionStorage.getItem('permissionNames');

    if (storedPermissions) {
      try {
        this.permissionNames = JSON.parse(storedPermissions);

        console.log(
          'Shipping Guarantee Permission Names:',
          this.permissionNames,
        );
      } catch (error) {
        console.error('Error parsing permissionNames:', error);

        this.permissionNames = [];
      }
    } else {
      console.warn('permissionNames not found in sessionStorage');

      this.permissionNames = [];
    }
  }

  loadTransactions(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.hasLoadedData = false;

    this.allTransactions = [];
    this.filteredTransactions = [];

    if (this.activeTab === 'live') {
      // this.api.getLiveEventHistoryForShippingGuarantee().subscribe({
      this.api
        .getLiveEventHistorySg()
        .pipe(
          finalize(() => {
            this.isLoading = false;
            this.hasLoadedData = true;
          }),
        )
        .subscribe({
          next: (txList) => {
            this.allTransactions = txList;
            this.applyFilters();
            // this.filteredTransactions = [...txList];
          },
          error: (error) => {
            console.error('Failed to load live transactions:', error);

            this.allTransactions = [];
            this.filteredTransactions = [];
          },
        });

      return;
    }

    const backendStatus = this.mapTabToBackendStatus(this.activeTab);

    this.api
      .getRecordTransactionsByStatusSg(backendStatus)
      .pipe(
        delay(1500),
        finalize(() => {
          this.isLoading = false;
          this.hasLoadedData = true;
        }),
      )
      .subscribe({
        next: (txList) => {
          this.allTransactions = txList;
          this.applyFilters();
        },
        error: (error) => {
          console.error(
            `Failed to load ${this.activeTab} transactions:`,
            error,
          );

          this.allTransactions = [];
          this.filteredTransactions = [];
        },
      });
  }

  // --- DATA LOADING ---
  setActiveTab(tab: string): void {
    if (this.activeTab === tab) {
      return;
    }

    this.activeTab = tab;
    this.currentPage = 1;
    // Clear existing data.
    // User must explicitly click Load Records.
    this.allTransactions = [];
    this.filteredTransactions = [];

    this.hasLoadedData = false;
  }
  // --- FILTERING ---

  applyFilters(): void {

    const query =
      this.searchQuery
        .toLowerCase()
        .trim();

    const currency =
      this.currencyFilter
        .toLowerCase()
        .trim();

    const filtered = this.allTransactions.filter((tx) => {
      const matchesSearch =
        !query ||
        tx.tnxId?.toLowerCase().includes(query) ||
        tx.beneficiaryName?.toLowerCase().includes(query) ||
        tx.currency?.toLowerCase().includes(query);

        const matchesCurrency =
          !currency ||
          tx.currency
            ?.toLowerCase() === currency;

        return (
          matchesSearch &&
          matchesCurrency
        );
      });

    this.applySorting(filtered);
  }

  clearSearch(): void {

    this.searchQuery = '';

    this.applyFilters();
  }

  // =========================================================
  // SORTING
  // =========================================================

  sortBy(
    column: typeof this.sortColumn
  ): void {

    if (
      this.sortColumn === column
    ) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    } else {

      this.sortColumn = column;
      this.sortDirection = 'asc';

    }

    this.applyFilters();
  }

  private applySorting(
    source: ShippingGuaranteeTransaction[] = this.allTransactions,
  ): void {
    const sorted = [...source].sort((a, b) => {
      let aVal = this.resolveColumn(a, this.sortColumn);
      let bVal = this.resolveColumn(b, this.sortColumn);

      // Handle null or undefined
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Handle Dates
      if (aVal instanceof Date && bVal instanceof Date) {
        return this.sortDirection === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      // Handle numbers
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

        const aStr =
          String(aVal);

        const bStr =
          String(bVal);

        return this.sortDirection === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);

      });

    this.filteredTransactions =
      sorted;

    this.currentPage = 1;
  }

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
  // PAGINATION
  // =========================================================

  get totalPages(): number {
    const count = Math.ceil(
      this.filteredTransactions.length / this.itemsPerPage,
    );
    return count < 1 ? 1 : count;
  }

  get pagedTransactions():
    ShippingGuaranteeTransaction[] {

    const start =
      (this.currentPage - 1) *
      this.itemsPerPage;

    return this.filteredTransactions
      .slice(
        start,
        start + this.itemsPerPage
      );
  }

  previousPage(): void {

    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {

    if (
      this.currentPage <
      this.totalPages
    ) {

      this.currentPage++;
    }
  }

  // --- NAVIGATION ACTIONS ---

  viewTransaction(tx: ShippingGuaranteeTransaction): void {
    if (!this.hasPermission('SG_InquiryPreview')) {
      console.warn('User does not have permission to view Shipping Guarantee.');

      return;
    }

    const readOnly = ['A', 'R'].includes(tx.status!);

    this.api.getTransactionSgByTnxId(tx.tnxId!).subscribe({
      next: (freshTx) => {
        this.transactionService.setCurrentTransaction(freshTx, readOnly);
        this.router.navigate([
          '/dashboard/Trade-Services/shipping-guarantee/preview',
        ]);
      },
      error: () => {
        this.transactionService.setCurrentTransaction(tx, readOnly);
        this.router.navigate([
          '/dashboard/Trade-Services/shipping-guarantee/preview',
        ]);
      },
    });
  }

  // =========================================================
  // OPEN SHIPPING GUARANTEE
  // Permission: View
  // =========================================================

  openShippingGuarantee(tx: ShippingGuaranteeTransaction) {
    if (!this.hasPermission('SG_InquiryPreview')) {
      console.warn('User does not have permission to open Shipping Guarantee.');

      return;
    }

    if (this.activeTab === 'live') {

      if (!this.hasPermission('SG_InquiryLive')) {

        console.warn(
          'User does not have Live inquiry permission.'
        );

        return;
      }

      this.router.navigate(
        ['/dashboard/Trade-Services/shipping-guarantee/amend', tx.tnxId],
        {
          queryParams: {
            mode: 'READ_ONLY',
            tab: 'live',
            eventRefNo: tx.eventRefNo ?? '',
          },
        },
      );

      return;
    }
    // Store transaction in service for import screen to pick up
    // this.transactionService.setCurrentTransaction(tx);
    const mode = this.resolveScreenMode(this.activeTab);
    // Navigate to import screen
    this.router.navigate(
      ['/dashboard/Trade-Services/shipping-guarantee', tx.tnxId],
      {
        state: {
          transaction: tx,
          // showUpdateSubmit: true // flag to show buttons
          mode: mode,
        },
      },
    );
  }

  trackByTnxId(_: number, tx: ShippingGuaranteeTransaction): string {
    return tx.eventRefNo ?? tx.tnxId!;
  }

  private resolveScreenMode(tab: string): 'EDIT' | 'APPROVAL' | 'READ_ONLY' {
    switch (tab) {

      case 'pending':
        return 'EDIT';

      case 'submitted':
        return 'APPROVAL';

      default:
        return 'READ_ONLY';
    }
  }

  // =========================================================
  // BACKEND STATUS
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

  // =========================
  // PDF REPORT
  // =========================
  async downloadReport(): Promise<void> {
    if (!this.filteredTransactions.length) {
      return;
    }

    // =========================
    // Colors
    // =========================
    const primaryColor: [number, number, number] = [31, 78, 121];
    const secondaryColor: [number, number, number] = [221, 235, 247];
    const textColor: [number, number, number] = [40, 40, 40];
    const mutedTextColor: [number, number, number] = [100, 100, 100];
    const borderColor: [number, number, number] = [190, 190, 190];
    const alternateRowColor: [number, number, number] = [245, 248, 252];
    const white: [number, number, number] = [255, 255, 255];

    // =========================
    // PDF
    // =========================
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const reportTitle = 'Shipping Guarantee Records Report';
    const statusTitle = this.activeTab.toUpperCase();

    // =========================
    // Status color
    // =========================
    let statusColor: [number, number, number];

    switch (this.activeTab.toLowerCase()) {
      case 'live':
        statusColor = [40, 167, 69];
        break;

      case 'pending':
        statusColor = [255, 193, 7];
        break;

      case 'submitted':
        statusColor = [0, 123, 255];
        break;

      case 'approved':
        statusColor = [40, 167, 69];
        break;

      case 'rejected':
        statusColor = [220, 53, 69];
        break;

      default:
        statusColor = [108, 117, 125];
    }

    // =========================
    // Top Header
    // =========================
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 20, 'F');

    try {
      const logo = await this.loadImageAsDataURL('/branding/infotech-logo.jpg');

      const logoWidth = 28;
      const logoHeight = (logo.height / logo.width) * logoWidth;

      doc.addImage(
        logo.dataUrl,
        'PNG',
        10,
        10 - logoHeight / 2,
        logoWidth,
        logoHeight,
      );
    } catch (error) {
      console.error('Unable to load report logo:', error);
    }

    // =========================
    // Report title
    // =========================
    doc.setTextColor(...white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);

    doc.text(reportTitle, pageWidth / 2, 13, {
      align: 'center',
    });

    // =========================
    // Status Badge
    // =========================
    const badgeWidth = 35;
    const badgeHeight = 8;
    const badgeX = pageWidth - badgeWidth - 14;
    const badgeY = 6;

    doc.setFillColor(...statusColor);

    doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 2, 2, 'F');

    doc.setTextColor(...white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);

    doc.text(statusTitle, badgeX + badgeWidth / 2, badgeY + 5.5, {
      align: 'center',
    });

    // =========================
    // Report Information Box
    // =========================
    const infoBoxY = 25;

    const hasFilters = this.searchQuery?.trim() || this.currencyFilter?.trim();

    const infoBoxHeight = hasFilters ? 27 : 19;

    doc.setFillColor(...secondaryColor);

    doc.roundedRect(10, infoBoxY, pageWidth - 20, infoBoxHeight, 3, 3, 'F');

    // =========================
    // Labels
    // =========================
    doc.setTextColor(...mutedTextColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    doc.text('Generated', 15, infoBoxY + 7);
    doc.text('Total Records', 95, infoBoxY + 7);
    doc.text('Status', 180, infoBoxY + 7);

    // =========================
    // Values
    // =========================
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);

    doc.text(this.formatReportDate(new Date()), 15, infoBoxY + 13);

    doc.text(String(this.filteredTransactions.length), 95, infoBoxY + 13);

    doc.text(statusTitle, 180, infoBoxY + 13);

    // =========================
    // Filters
    // =========================
    let filterText = '';

    if (this.searchQuery?.trim()) {
      filterText += `Search: ${this.searchQuery.trim()}`;
    }

    if (this.currencyFilter?.trim()) {
      if (filterText) {
        filterText += '  |  ';
      }

      filterText += `Currency: ${this.currencyFilter.trim()}`;
    }

    if (filterText) {
      doc.setTextColor(...mutedTextColor);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      doc.text(filterText, 15, infoBoxY + 22);
    }

    // =========================
    // Table Data
    // =========================
    const headers = this.getReportHeaders();

    const rows = this.filteredTransactions.map((tx) => this.getReportRow(tx));

    // =========================
    // Column Styles
    // =========================
    const columnStyles: {
      [key: number]: any;
    } = {};

    if (this.activeTab === 'live') {
      Object.assign(columnStyles, {
        0: { cellWidth: 36 }, // Event Ref No
        1: { cellWidth: 28 }, // TNX ID
        2: { cellWidth: 15 }, // Event Sequence
        3: { cellWidth: 20 }, // Event
        4: { cellWidth: 24 }, // Created
        5: { cellWidth: 35 }, // Issuer Reference
        6: { cellWidth: 25, halign: 'right' }, // Amount
        7: { cellWidth: 25 }, // Expiry Date
        8: { cellWidth: 35 }, // Customer Reference
        9: { cellWidth: 40 }, // Bill Of Lading
      });
    } else {
      Object.assign(columnStyles, {
        0: { cellWidth: 30 }, // TNX ID
        1: { cellWidth: 25 }, // Created
        2: { cellWidth: 40 }, // Issuer Reference
        3: { cellWidth: 30, halign: 'right' }, // Amount
        4: { cellWidth: 28 }, // Expiry Date
        5: { cellWidth: 40 }, // Customer Reference
        6: { cellWidth: 45 }, // Bill Of Lading
      });
    }

    // =========================
    // Table
    // =========================
    autoTable(doc, {
      head: [headers],
      body: rows,

      startY: infoBoxY + infoBoxHeight + 7,

      theme: 'grid',

      styles: {
        font: 'helvetica',
        fontSize: 7,
        cellPadding: 2.5,
        valign: 'middle',
        halign: 'center',

        textColor: textColor,
        lineColor: borderColor,
        lineWidth: 0.2,
      },

      headStyles: {
        fillColor: primaryColor,
        textColor: white,

        fontSize: 7,
        fontStyle: 'bold',

        halign: 'center',
        valign: 'middle',

        cellPadding: 3,

        lineColor: primaryColor,
        lineWidth: 0.3,
      },

      bodyStyles: {
        fontSize: 7,
        textColor: textColor,
      },

      alternateRowStyles: {
        fillColor: alternateRowColor,
      },

      columnStyles,

      margin: {
        top: 10,
        right: 10,
        bottom: 18,
        left: 10,
      },

      rowPageBreak: 'avoid',

      didDrawPage: () => {
        // =========================
        // Footer
        // =========================
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.3);

        doc.line(10, pageHeight - 13, pageWidth - 10, pageHeight - 13);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...mutedTextColor);

        doc.text('Shipping Guarantee Records', 10, pageHeight - 7);

        doc.text(
          `Generated: ${this.formatReportDate(new Date())}`,
          pageWidth / 2,
          pageHeight - 7,
          {
            align: 'center',
          },
        );
      },
    });

    // =========================
    // Page Numbers
    // =========================
    const totalPages = doc.getNumberOfPages();

    for (let page = 1; page <= totalPages; page++) {
      doc.setPage(page);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...mutedTextColor);

      doc.text(
        `Page ${page} of ${totalPages}`,
        pageWidth - 10,
        pageHeight - 7,
        {
          align: 'right',
        },
      );
    }

    // =========================
    // File Name
    // =========================
    const fileName = `Shipping_Guarantee_${this.activeTab}_Report_${this.getCurrentDate()}.pdf`;

    doc.save(fileName);
  }

  // =========================
  // REPORT HEADERS
  // =========================
  private getReportHeaders(): string[] {
    if (this.activeTab === 'live') {
      return [
        'Event Ref No',
        'TNX ID',
        'Event Sequence',
        'Event',
        'Created',
        'Issuer Reference',
        'Amount',
        'Expiry Date',
        'Customer Reference',
        'Bill Of Lading',
      ];
    }

    return [
      'TNX ID',
      'Created',
      'Issuer Reference',
      'Amount',
      'Expiry Date',
      'Customer Reference',
      'Bill Of Lading',
    ];
  }

  // =========================
  // LOAD IMAGE
  // =========================
  private loadImageAsDataURL(imagePath: string): Promise<{
    dataUrl: string;
    width: number;
    height: number;
  }> {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement('canvas');

        canvas.width = image.width;
        canvas.height = image.height;

        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('Could not create canvas context'));
          return;
        }

        context.drawImage(image, 0, 0);

        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          width: image.width,
          height: image.height,
        });
      };

      image.onerror = () => {
        reject(new Error(`Could not load image: ${imagePath}`));
      };

      image.src = imagePath;
    });
  }

  // =========================
  // REPORT ROW
  // =========================
  private getReportRow(tx: ShippingGuaranteeTransaction): any[] {
    if (this.activeTab === 'live') {
      return [
        tx.eventRefNo ?? '',
        tx.tnxId ?? '',
        String(tx.eventSequence ?? ''),
        tx.eventType ?? '',
        this.formatReportDate(tx.createdOn),
        tx.issuerReference ?? '',
        this.formatReportAmount(tx.amount),
        this.formatReportDate(tx.expiryDate),
        tx.customerReference ?? '',
        tx.billoflading ?? '',
      ];
    }

    return [
      tx.tnxId ?? '',
      this.formatReportDate(tx.createdOn),
      tx.issuerReference ?? '',
      this.formatReportAmount(tx.amount),
      this.formatReportDate(tx.expiryDate),
      tx.customerReference ?? '',
      tx.billoflading ?? '',
    ];
  }

  // =========================
  // FORMAT AMOUNT
  // =========================
  private formatReportAmount(amount: any): string {
    if (amount === null || amount === undefined || amount === '') {
      return '';
    }

    const numericAmount = Number(amount);

    if (isNaN(numericAmount)) {
      return String(amount);
    }

    return numericAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // =========================
  // FORMAT DATE
  // =========================
  private formatReportDate(date: any): string {
    if (!date) {
      return '';
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return String(date);
    }

    const day = String(parsedDate.getDate()).padStart(2, '0');

    const month = parsedDate.toLocaleString('en-US', {
      month: 'short',
    });

    const year = parsedDate.getFullYear();

    return `${day}-${month}-${year}`;
  }

  // =========================
  // CURRENT DATE
  // =========================
  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // =========================
  // EXCEL ROW
  // =========================
  private getExcelRow(tx: ShippingGuaranteeTransaction): any[] {
    if (this.activeTab === 'live') {
      return [
        tx.eventRefNo ?? '',
        tx.tnxId ?? '',
        tx.eventSequence ?? '',
        tx.eventType ?? '',
        tx.createdOn ?? '',
        tx.issuerReference ?? '',
        tx.amount ?? '',
        tx.expiryDate ?? '',
        tx.customerReference ?? '',
        tx.billoflading ?? '',
      ];
    }

    return [
      tx.tnxId ?? '',
      tx.createdOn ?? '',
      tx.issuerReference ?? '',
      tx.amount ?? '',
      tx.expiryDate ?? '',
      tx.customerReference ?? '',
      tx.billoflading ?? '',
    ];
  }

  // =========================
  // EXCEL EXPORT
  // =========================
  private downloadExcel(): void {
    if (!this.filteredTransactions.length) {
      return;
    }

    const headers = this.getReportHeaders();

    const rows = this.filteredTransactions.map((tx) => this.getExcelRow(tx));

    const worksheetData = [headers, ...rows];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Shipping Guarantee Records',
    );

    // Optional: make columns readable
    worksheet['!cols'] = headers.map((header, index) => {
      let width = 20;

      switch (header) {
        case 'Event Ref No':
          width = 25;
          break;

        case 'TNX ID':
          width = 22;
          break;

        case 'Event Sequence':
          width = 15;
          break;

        case 'Event':
          width = 20;
          break;

        case 'Created':
        case 'Expiry Date':
          width = 15;
          break;

        case 'Issuer Reference':
          width = 30;
          break;

        case 'Amount':
          width = 20;
          break;

        case 'Customer Reference':
          width = 30;
          break;

        case 'Bill Of Lading':
          width = 30;
          break;
      }

      return { wch: width };
    });

    const fileName = `Shipping_Guarantee_${this.activeTab}_Report_${this.getCurrentDate()}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  }

  // =========================
  // EXPORT DROPDOWN
  // =========================
  onExportSelected(format: ExportFormat): void {
    switch (format) {
      case 'excel':
        this.downloadExcel();
        break;

      case 'pdf':
        this.downloadReport();
        break;
    }
  }
}
