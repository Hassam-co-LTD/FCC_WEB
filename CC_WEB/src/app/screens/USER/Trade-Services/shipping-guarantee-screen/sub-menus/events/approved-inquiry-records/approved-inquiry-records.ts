import { CommonModule, isPlatformBrowser } from '@angular/common';
import { finalize, delay } from 'rxjs/operators';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { ShippingGuaranteeTransaction } from '../../../../../../../core/models/shipping-guarantee';

import { ApiService } from '../../../../../../../core/services/api.service';

import { ShippingGuaranteeFormTransactionService } from '../../../../../../../core/services/user-service/shipping-guarantee-form-transaction-service/shipping-guarantee-form-transaction-service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ExportDropdown,
  ExportFormat,
} from '../../../../../../../shared/export-dropdown/export-dropdown';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-approved-inquiry-records',
  imports: [CommonModule, MatIconModule, FormsModule, ExportDropdown],
  templateUrl: './approved-inquiry-records.html',

  styleUrls: ['./approved-inquiry-records.scss']
})
export class ApprovedInquiryRecords implements OnInit {
  isLoading = false;
  hasLoadedData = false;

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
  activeTab = 'live';
  tabs = [
    { key: 'live', label: 'Live' },
    { key: 'pending', label: 'Pending' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    // { key: 'response awaited', label: 'Response Awaited'}
  ];
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
    private route: ActivatedRoute,
  ) {}
  permissionNames: string[] = [];

  // CHECK PERMISSION
  hasPermission(permission: string): boolean {
    return this.permissionNames.some(
      (p) => p?.trim().toLowerCase() === permission.trim().toLowerCase(),
    );
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


  // =========================================================
  // ON INIT
  // =========================================================

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.loadPermissions();

    this.route.queryParamMap.subscribe((params) => {
      const tab = params.get('tab');
      if (tab && this.tabs.some((t) => t.key === tab)) {
        this.activeTab = tab;

      }
      this.hasLoadedData = false;
      this.allTransactions = [];
      this.filteredTransactions = [];
    });

    // this.transactionService.transactionsStream$.subscribe((txList) => {
    //   this.allTransactions = txList;
    //   this.applyFilters();
    // });
  }

  loadApprovedTransactions(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.hasLoadedData = false;

    this.allTransactions = [];
    this.filteredTransactions = [];
    if (this.activeTab === 'live') {
      this.api
        .getApprovedMasterSgRecords()
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
            console.error('Failed to load transactions:', error);

            this.allTransactions = [];
            this.filteredTransactions = [];
          },
        });

      return;
    }

    const backendStatus = this.mapTabToBackendStatus(this.activeTab);

    this.api
      .getAmendRecordTransactionsByStatusSg(backendStatus)
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

  get totalPages(): number {
    const count = Math.ceil(
      this.filteredTransactions.length / this.itemsPerPage,
    );
    return count < 1 ? 1 : count;
  }

  get pagedTransactions(): ShippingGuaranteeTransaction[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTransactions.slice(start, start + this.itemsPerPage);
  }

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


    const filtered = this.allTransactions.filter((tx) => {
      const matchesSearch =
        !query ||
        tx.tnxId?.toLowerCase().includes(query) ||
        tx.beneficiaryName?.toLowerCase().includes(query) ||
        tx.currency?.toLowerCase().includes(query);

      const matchesCurrency =
        !currency || tx.currency?.toLowerCase() === currency;

      return matchesSearch && matchesCurrency;
    });

    this.applySorting(filtered);
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

      // Everything else: convert to string and use localeCompare
      const aStr = String(aVal);
      const bStr = String(bVal);
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

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

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

  // simple sorting helper
  toggleSort(column: keyof ShippingGuaranteeTransaction): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }

  private applySort(): void {
    const dir = this.sortDirection === 'asc' ? 1 : -1;
    this.filteredTransactions.sort((a, b) => {
      const va: any = a[this.sortColumn] ?? '';
      const vb: any = b[this.sortColumn] ?? '';
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  // viewTransaction(tx: ImportLcTransaction): void {
  //   this.transactionService.setCurrentTransaction(tx, true);
  //   this.router.navigate(['/import-screen/preview']);
  // }
  viewTransaction(tx: ShippingGuaranteeTransaction): void {
    const readOnly = ['A', 'R'].includes(tx.status!);

    this.api.getAmendmentByTnxIdSg(tx.tnxId!).subscribe({
      next: (freshTx) => {
        this.transactionService.setCurrentTransaction(freshTx, readOnly);
        this.router.navigate([
          '/dashboard/Trade-Services/shipping-guarantee/amend/preview',
        ]);
      },
      error: () => {
        this.transactionService.setCurrentTransaction(tx, readOnly);
        this.router.navigate([
          '/dashboard/Trade-Services/shipping-guarantee/amend/preview',
        ]);
      },
    });
  }

  openApprovedAmendTransactionSG(tx: ShippingGuaranteeTransaction): void {
    this.router.navigate(
      ['/dashboard/Trade-Services/shipping-guarantee/amend', tx.tnxId],
      {
        queryParams: {
          mode: 'EDIT',
          tab: this.activeTab,
          eventType:
            this.activeTab === 'live' ? 'AMD' : (tx.eventType ?? 'AMD'),
          // Only pass eventRefNo for non-live tabs (for navigating to a specific event)
          ...(this.activeTab !== 'live' && { eventRefNo: tx.eventRefNo ?? '' }),
        },
      },
    );
  }

  trackByTnxId(_: number, tx: ShippingGuaranteeTransaction): string {
    return tx.tnxId!;
  }

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
    // Status Color
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
    // Report Title
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

    // Labels
    doc.setTextColor(...mutedTextColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    doc.text('Generated', 15, infoBoxY + 7);
    doc.text('Total Records', 95, infoBoxY + 7);
    doc.text('Status', 180, infoBoxY + 7);

    // Values
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
        0: { cellWidth: 32 }, // TNX ID
        1: { cellWidth: 28 }, // Created
        2: { cellWidth: 35 }, // Issuer Reference
        3: { cellWidth: 25, halign: 'right' }, // Amount
        4: { cellWidth: 28 }, // Expiry Date
        5: { cellWidth: 38 }, // Customer Reference
        6: { cellWidth: 35 }, // Bill Of Lading
      });
    } else {
      Object.assign(columnStyles, {
        0: { cellWidth: 25 }, // TNX ID
        1: { cellWidth: 20 }, // Event
        2: { cellWidth: 32 }, // Event Ref No
        3: { cellWidth: 18 }, // Event Sequence
        4: { cellWidth: 25 }, // Created
        5: { cellWidth: 32 }, // Issuer Reference
        6: { cellWidth: 23, halign: 'right' }, // Amount
        7: { cellWidth: 25 }, // Expiry Date
        8: { cellWidth: 35 }, // Customer Reference
        9: { cellWidth: 35 }, // Bill Of Lading
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

  // =====================================================
  // REPORT HEADERS
  // =====================================================
  private getReportHeaders(): string[] {
    if (this.activeTab === 'live') {
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

    return [
      'TNX ID',
      'Event',
      'Event Ref No',
      'Event Sequence',
      'Created',
      'Issuer Reference',
      'Amount',
      'Expiry Date',
      'Customer Reference',
      'Bill Of Lading',
    ];
  }

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
  // =====================================================
  // REPORT ROW
  // =====================================================
  private getReportRow(tx: ShippingGuaranteeTransaction): any[] {
    if (this.activeTab === 'live') {
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

    return [
      tx.tnxId ?? '',
      tx.eventType ?? '',
      tx.eventRefNo ?? '',
      tx.eventSequence ?? '',
      this.formatReportDate(tx.createdOn),
      tx.issuerReference ?? '',
      this.formatReportAmount(tx.amount),
      this.formatReportDate(tx.expiryDate),
      tx.customerReference ?? '',
      tx.billoflading ?? '',
    ];
  }

  // =====================================================
  // EXCEL ROW
  // =====================================================
  private getExcelRow(tx: ShippingGuaranteeTransaction): any[] {
    if (this.activeTab === 'live') {
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

    return [
      tx.tnxId ?? '',
      tx.eventType ?? '',
      tx.eventRefNo ?? '',
      tx.eventSequence ?? '',
      tx.createdOn ?? '',
      tx.issuerReference ?? '',
      tx.amount ?? '',
      tx.expiryDate ?? '',
      tx.customerReference ?? '',
      tx.billoflading ?? '',
    ];
  }

  // =====================================================
  // EXCEL DOWNLOAD
  // =====================================================
  private downloadExcel(): void {
    if (!this.filteredTransactions.length) {
      return;
    }

    const headers = this.getReportHeaders();

    const rows = this.filteredTransactions.map((tx) => this.getExcelRow(tx));

    const worksheetData = [headers, ...rows];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Optional column widths
    worksheet['!cols'] = headers.map((header) => {
      switch (header) {
        case 'TNX ID':
          return { wch: 22 };

        case 'Event':
          return { wch: 15 };

        case 'Event Ref No':
          return { wch: 25 };

        case 'Event Sequence':
          return { wch: 18 };

        case 'Created':
          return { wch: 15 };

        case 'Issuer Reference':
          return { wch: 25 };

        case 'Amount':
          return { wch: 18 };

        case 'Expiry Date':
          return { wch: 15 };

        case 'Customer Reference':
          return { wch: 25 };

        case 'Bill Of Lading':
          return { wch: 40 };

        default:
          return { wch: 20 };
      }
    });

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Shipping Guarantee Records',
    );

    const fileName = `Shipping_Guarantee_${this.activeTab}_Report_${this.getCurrentDate()}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  }

  // =====================================================
  // AMOUNT FORMAT
  // =====================================================
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

  // =====================================================
  // DATE FORMAT
  // =====================================================
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

  // =====================================================
  // CURRENT DATE
  // =====================================================
  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // =====================================================
  // EXPORT HANDLER
  // =====================================================
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