import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { finalize, delay } from 'rxjs/operators';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { ExportCollectionTransaction } from '../../../../../../../core/models/export-collection';
import { ApiService } from '../../../../../../../core/services/api.service';
import { ExportCollectionFormTransactionService } from '../../../../../../../core/services/user-service/export-collection-form-transaction-service/export-collection-form-transaction';
import {
  ExportDropdown,
  ExportFormat,
} from '../../../../../../../shared/export-dropdown/export-dropdown';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-approved-inquiry-records',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, ExportDropdown],
  templateUrl: './approved-inquiry-records.html',
  styleUrls: ['./approved-inquiry-records.scss'],
})
export class ApprovedInquiryRecords implements OnInit {
  isLoading = false;
  hasLoadedData = false;

  currentPage = 1;
  itemsPerPage = 10;

  allTransactions: ExportCollectionTransaction[] = [];
  filteredTransactions: ExportCollectionTransaction[] = [];

  showAdvanced = false;
  searchQuery = '';
  currencyFilter = '';

  activeTab = 'live';

  // =========================================================
  // PERMISSIONS
  // =========================================================

  permissionNames: string[] = [];

  hasPermission(permission: string): boolean {
    return this.permissionNames.some(
      (p) => p.trim().toLowerCase() === permission.toLowerCase(),
    );
  }

  tabs = [
    { key: 'live', label: 'Live', permission: 'Inquiry' },
    { key: 'pending', label: 'Pending', permission: 'Inquiry' },
    { key: 'submitted', label: 'Submitted', permission: 'Inquiry' },
    { key: 'approved', label: 'Approved', permission: 'Inquiry' },
    { key: 'rejected', label: 'Rejected', permission: 'Inquiry' },
  ];

  sortColumn: keyof ExportCollectionTransaction = 'createdOn';
  sortDirection: 'asc' | 'desc' = 'desc';

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  constructor(
    private api: ApiService,
    private transactionService: ExportCollectionFormTransactionService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.loadPermissions();

    this.route.queryParamMap.subscribe((params) => {
      const tab = params.get('tab');

      if (
        tab &&
        this.tabs.some((t) => t.key === tab && this.hasPermission(t.permission))
      ) {
        this.activeTab = tab;
      }
      this.hasLoadedData = false;
      this.allTransactions = [];
      this.filteredTransactions = [];

      // this.currentPage = 1;
      // this.loadApprovedTransactions();
    });

    // this.transactionService.transactionsStream$.subscribe((txList) => {
    //   this.allTransactions = txList;
    //   this.applyFilters();
    // });
  }

  // =========================================================
  // PERMISSION HELPER
  // =========================================================

  private loadPermissions(): void {
    const stored = sessionStorage.getItem('permissionNames');

    if (!stored) {
      this.permissionNames = [];
      return;
    }

    try {
      this.permissionNames = JSON.parse(stored).map((p: string) =>
        p.trim().toLowerCase(),
      );
    } catch {
      this.permissionNames = [];
    }

    console.log('Export Collection Permissions:', this.permissionNames);
  }

  // =========================================================
  // LOAD RECORDS
  // =========================================================

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
        .getApprovedMasterLcRecordsExportCollection()
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
          },
          error: (error) => {
            console.error('Failed to load transactions:', error);

            this.allTransactions = [];
            this.filteredTransactions = [];
          },
        });

      return;
    }

    const backend = this.mapTabToBackendStatus(this.activeTab);

    this.api
      .getAmendRecordTransactionsByStatusExportCollection(backend)
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

  // =========================================================
  // PAGINATION
  // =========================================================

  get pagedTransactions(): ExportCollectionTransaction[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTransactions.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredTransactions.length / this.itemsPerPage),
    );
  }

  // =========================================================
  // FILTER
  // =========================================================

  applyFilters(): void {
    const query = this.searchQuery.toLowerCase().trim();
    const currency = this.currencyFilter.toLowerCase().trim();

    const filtered = this.allTransactions.filter((tx) => {
      const matchesSearch =
        !query ||
        tx.tnxId?.toLowerCase().includes(query) ||
        tx.currency?.toLowerCase().includes(query);

      const matchesCurrency =
        !currency || tx.currency?.toLowerCase() === currency;

      return matchesSearch && matchesCurrency;
    });

    this.applySorting(filtered);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  // =========================================================
  // SORT
  // =========================================================

  private applySorting(
    source: ExportCollectionTransaction[] = this.allTransactions,
  ): void {
    this.filteredTransactions = [...source].sort((a, b) => {
      const aVal = this.resolveColumn(a, this.sortColumn);
      const bVal = this.resolveColumn(b, this.sortColumn);

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const result = String(aVal).localeCompare(String(bVal));

      return this.sortDirection === 'asc' ? result : -result;
    });

    this.currentPage = 1;
  }

  private resolveColumn(tx: ExportCollectionTransaction, column: string): any {
    switch (column) {
      case 'tnxId':
        return tx.tnxId;
      case 'currency':
        return tx.currency;
      case 'amount':
        return tx.amount;
      case 'createdOn':
        return tx.createdOn;
      default:
        return null;
    }
  }

  toggleSort(column: keyof ExportCollectionTransaction): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.applySorting(this.filteredTransactions);
  }

  // =========================================================
  // TABS
  // =========================================================

  setActiveTab(tab: string): void {
    if (this.activeTab === tab) return;

    this.activeTab = tab;
    this.currentPage = 1;
    // Clear existing data.
    // User must explicitly click Load Records.
    this.allTransactions = [];
    this.filteredTransactions = [];

    this.hasLoadedData = false;
  }

  // =========================================================
  // TRANSACTION ACTIONS
  // =========================================================

  trackByTnxId(_: number, tx: ExportCollectionTransaction): string {
    return tx.tnxId!;
  }

  viewTransaction(tx: ExportCollectionTransaction): void {
    if (!this.hasPermission('EC_Inquiry')) {
      console.warn('Inquiry permission denied');
      return;
    }

    const readOnly = ['A', 'R'].includes(tx.status!);

    this.api.getAmendmentByTnxIdExportCollection(tx.tnxId!).subscribe({
      next: (freshTx) => {
        this.transactionService.setCurrentTransaction(freshTx, readOnly);

        this.router.navigate([
          'dashboard/Trade-Services/export-collection/amend/preview',
        ]);
      },

      error: () => {
        this.transactionService.setCurrentTransaction(tx, readOnly);

        this.router.navigate([
          'dashboard/Trade-Services/export-collection/amend/preview',
        ]);
      },
    });
  }

  openApprovedAmendTransaction(tx: ExportCollectionTransaction): void {
    if (!this.hasPermission('EC_Amend')) {
      console.warn('Amend permission denied');
      return;
    }

    this.router.navigate(
      ['dashboard/Trade-Services/export-collection/amend', tx.tnxId],
      {
        queryParams: {
          mode: 'EDIT',
          tab: this.activeTab,
          eventType:
            this.activeTab === 'live' ? 'AMD' : (tx.eventType ?? 'AMD'),

          ...(this.activeTab !== 'live' && {
            eventRefNo: tx.eventRefNo ?? '',
          }),
        },
      },
    );
  }

  // =========================================================
  // PAGINATION
  // =========================================================

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  private mapTabToBackendStatus(tab: string): string {
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


// ============================================================
// PDF DOWNLOAD
// ============================================================
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

  const reportTitle = 'Export Collection Records Report';
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
  // Header
  // =========================
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 20, 'F');

  // =========================
  // Logo
  // =========================
  try {
    const logo = await this.loadImageAsDataURL(
      '/branding/infotech-logo.jpg'
    );

    const logoWidth = 28;
    const logoHeight =
      (logo.height / logo.width) * logoWidth;

    doc.addImage(
      logo.dataUrl,
      'PNG',
      10,
      10 - logoHeight / 2,
      logoWidth,
      logoHeight
    );
  } catch (error) {
    console.error(
      'Unable to load report logo:',
      error
    );
  }

  // =========================
  // Report Title
  // =========================
  doc.setTextColor(...white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);

  doc.text(
    reportTitle,
    pageWidth / 2,
    13,
    {
      align: 'center',
    }
  );

  // =========================
  // Status Badge
  // =========================
  const badgeWidth = 35;
  const badgeHeight = 8;
  const badgeX =
    pageWidth - badgeWidth - 14;
  const badgeY = 6;

  doc.setFillColor(...statusColor);

  doc.roundedRect(
    badgeX,
    badgeY,
    badgeWidth,
    badgeHeight,
    2,
    2,
    'F'
  );

  doc.setTextColor(...white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);

  doc.text(
    statusTitle,
    badgeX + badgeWidth / 2,
    badgeY + 5.5,
    {
      align: 'center',
    }
  );

  // =========================
  // Information Box
  // =========================
  const infoBoxY = 25;

  const hasFilters =
    !!this.searchQuery?.trim() ||
    !!this.currencyFilter?.trim();

  const infoBoxHeight =
    hasFilters ? 27 : 19;

  doc.setFillColor(...secondaryColor);

  doc.roundedRect(
    10,
    infoBoxY,
    pageWidth - 20,
    infoBoxHeight,
    3,
    3,
    'F'
  );

  // Labels
  doc.setTextColor(...mutedTextColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  doc.text(
    'Generated',
    15,
    infoBoxY + 7
  );

  doc.text(
    'Total Records',
    95,
    infoBoxY + 7
  );

  doc.text(
    'Status',
    180,
    infoBoxY + 7
  );

  // Values
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  doc.text(
    this.formatReportDate(new Date()),
    15,
    infoBoxY + 13
  );

  doc.text(
    String(this.filteredTransactions.length),
    95,
    infoBoxY + 13
  );

  doc.text(
    statusTitle,
    180,
    infoBoxY + 13
  );

  // =========================
  // Filters
  // =========================
  let filterText = '';

  if (this.searchQuery?.trim()) {
    filterText =
      `Search: ${this.searchQuery.trim()}`;
  }

  if (this.currencyFilter?.trim()) {
    if (filterText) {
      filterText += '  |  ';
    }

    filterText +=
      `Currency: ${this.currencyFilter.trim()}`;
  }

  if (filterText) {
    doc.setTextColor(...mutedTextColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    doc.text(
      filterText,
      15,
      infoBoxY + 22,
      {
        maxWidth: pageWidth - 30,
      }
    );
  }

  // =========================
  // Table Data
  // =========================
  const headers =
    this.getReportHeaders();

  const rows =
    this.filteredTransactions.map((tx) =>
      this.getReportRow(tx)
    );

  // =========================
  // Column Styles
  // =========================
  const columnStyles: {
    [key: number]: any;
  } = {};

  if (this.activeTab === 'live') {
    Object.assign(columnStyles, {
      0: {
        cellWidth: 30,
        halign: 'left',
      }, // TNX ID

      1: {
        cellWidth: 25,
        halign: 'center',
      }, // Created

      2: {
        cellWidth: 25,
        halign: 'left',
      }, // Issuer Reference

      3: {
        cellWidth: 18,
        halign: 'center',
      }, // Currency

      4: {
        cellWidth: 27,
        halign: 'right',
      }, // Amount

      5: {
        cellWidth: 40,
        halign: 'left',
      }, // Drawer

      6: {
        cellWidth: 40,
        halign: 'left',
      }, // Drawee
    });
  } else {
    Object.assign(columnStyles, {
      0: {
        cellWidth: 25,
        halign: 'left',
      }, // TNX ID

      1: {
        cellWidth: 20,
        halign: 'left',
      }, // Event

      2: {
        cellWidth: 32,
        halign: 'left',
      }, // Event Ref No

      3: {
        cellWidth: 20,
        halign: 'center',
      }, // Event Sequence

      4: {
        cellWidth: 25,
        halign: 'center',
      }, // Created

      5: {
        cellWidth: 25,
        halign: 'left',
      }, // Issuer Reference

      6: {
        cellWidth: 18,
        halign: 'center',
      }, // Currency

      7: {
        cellWidth: 27,
        halign: 'right',
      }, // Amount

      8: {
        cellWidth: 38,
        halign: 'left',
      }, // Drawer

      9: {
        cellWidth: 38,
        halign: 'left',
      }, // Drawee
    });
  }

  // =========================
  // Table
  // =========================
  autoTable(doc, {
    head: [headers],
    body: rows,

    startY:
      infoBoxY +
      infoBoxHeight +
      7,

    theme: 'grid',

    styles: {
      font: 'helvetica',
      fontSize: 7,
      cellPadding: 2.5,

      valign: 'middle',
      halign: 'center',

      textColor,
      lineColor: borderColor,
      lineWidth: 0.2,

      overflow: 'linebreak',
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
      textColor,
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

    // =========================
    // Footer
    // =========================
    didDrawPage: () => {
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.3);

      doc.line(
        10,
        pageHeight - 13,
        pageWidth - 10,
        pageHeight - 13
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...mutedTextColor);

      doc.text(
        'Export Collection Records',
        10,
        pageHeight - 7
      );

      doc.text(
        `Generated: ${this.formatReportDate(
          new Date()
        )}`,
        pageWidth / 2,
        pageHeight - 7,
        {
          align: 'center',
        }
      );
    },
  });

  // =========================
  // Page Numbers
  // =========================
  const totalPages =
    doc.getNumberOfPages();

  for (
    let page = 1;
    page <= totalPages;
    page++
  ) {
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
      }
    );
  }

  // =========================
  // File Name
  // =========================
  const fileName =
    `Export_Collection_${this.activeTab}_Report_${this.getCurrentDate()}.pdf`;

  doc.save(fileName);
}


// ============================================================
// REPORT HEADERS
// EXACTLY MATCHES HTML TABLE
// ============================================================
private getReportHeaders(): string[] {
  // =========================
  // LIVE
  // =========================
  if (this.activeTab === 'live') {
    return [
      'TNX ID',
      'Created',
      'Issuer Reference',
      'Currency',
      'Amount',
      'Drawer',
      'Drawee',
    ];
  }

  // =========================
  // NON-LIVE
  // =========================
  return [
    'TNX ID',
    'Event',
    'Event Ref No',
    'Event Sequence',
    'Created',
    'Issuer Reference',
    'Currency',
    'Amount',
    'Drawer',
    'Drawee',
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


// ============================================================
// REPORT ROW
// EXACTLY MATCHES HTML TABLE
// ============================================================
private getReportRow(
  tx: ExportCollectionTransaction
): any[] {

  // =========================
  // LIVE
  // =========================
  if (this.activeTab === 'live') {
    return [
      tx.tnxId ?? '',
      this.formatReportDate(tx.createdOn),
      tx.issuerReference ?? '',
      tx.currency ?? '',
      this.formatReportAmount(tx.amount),
      tx.drawerName ?? '',
      tx.draweeName ?? '',
    ];
  }

  // =========================
  // NON-LIVE
  // =========================
  return [
    tx.tnxId ?? '',
    tx.eventType ?? '',
    tx.eventRefNo ?? '',
    tx.eventSequence ?? '',
    this.formatReportDate(tx.createdOn),
    tx.issuerReference ?? '',
    tx.currency ?? '',
    this.formatReportAmount(tx.amount),
    tx.drawerName ?? '',
    tx.draweeName ?? '',
  ];
}


// ============================================================
// EXCEL ROW
// EXACTLY MATCHES HTML TABLE
// ============================================================
private getExcelRow(
  tx: ExportCollectionTransaction
): any[] {

  // =========================
  // LIVE
  // =========================
  if (this.activeTab === 'live') {
    return [
      tx.tnxId ?? '',
      this.formatReportDate(tx.createdOn),
      tx.issuerReference ?? '',
      tx.currency ?? '',
      this.formatReportAmount(tx.amount),
      tx.drawerName ?? '',
      tx.draweeName ?? '',
    ];
  }

  // =========================
  // NON-LIVE
  // =========================
  return [
    tx.tnxId ?? '',
    tx.eventType ?? '',
    tx.eventRefNo ?? '',
    tx.eventSequence ?? '',
    this.formatReportDate(tx.createdOn),
    tx.issuerReference ?? '',
    tx.currency ?? '',
    this.formatReportAmount(tx.amount),
    tx.drawerName ?? '',
    tx.draweeName ?? '',
  ];
}


// ============================================================
// EXCEL DOWNLOAD
// ============================================================
private downloadExcel(): void {
  if (!this.filteredTransactions.length) {
    return;
  }

  const headers =
    this.getReportHeaders();

  const rows =
    this.filteredTransactions.map((tx) =>
      this.getExcelRow(tx)
    );

  const worksheetData = [
    headers,
    ...rows,
  ];

  const worksheet =
    XLSX.utils.aoa_to_sheet(
      worksheetData
    );

  // =========================
  // Excel Column Widths
  // =========================
  if (this.activeTab === 'live') {
    worksheet['!cols'] = [
      { wch: 25 }, // TNX ID
      { wch: 15 }, // Created
      { wch: 35 }, // Issuer Reference
      { wch: 12 }, // Currency
      { wch: 18 }, // Amount
      { wch: 35 }, // Drawer
      { wch: 35 }, // Drawee
    ];
  } else {
    worksheet['!cols'] = [
      { wch: 25 }, // TNX ID
      { wch: 20 }, // Event
      { wch: 30 }, // Event Ref No
      { wch: 18 }, // Event Sequence
      { wch: 15 }, // Created
      { wch: 35 }, // Issuer Reference
      { wch: 12 }, // Currency
      { wch: 18 }, // Amount
      { wch: 35 }, // Drawer
      { wch: 35 }, // Drawee
    ];
  }

  // =========================
  // Workbook
  // =========================
  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Export Collection'
  );

  // =========================
  // File Name
  // =========================
  const fileName =
    `Export_Collection_${this.activeTab}_Report_${this.getCurrentDate()}.xlsx`;

  XLSX.writeFile(
    workbook,
    fileName
  );
}


// ============================================================
// AMOUNT FORMATTER
// ============================================================
private formatReportAmount(
  amount: any
): string {

  if (
    amount === null ||
    amount === undefined ||
    amount === ''
  ) {
    return '';
  }

  const numericAmount =
    Number(amount);

  if (isNaN(numericAmount)) {
    return String(amount);
  }

  return numericAmount.toLocaleString(
    'en-US',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
}


// ============================================================
// DATE FORMATTER
// ============================================================
private formatReportDate(
  date: any
): string {

  if (!date) {
    return '';
  }

  const parsedDate =
    new Date(date);

  if (
    isNaN(parsedDate.getTime())
  ) {
    return String(date);
  }

  const day =
    String(
      parsedDate.getDate()
    ).padStart(2, '0');

  const month =
    parsedDate.toLocaleString(
      'en-US',
      {
        month: 'short',
      }
    );

  const year =
    parsedDate.getFullYear();

  return `${day}-${month}-${year}`;
}


// ============================================================
// CURRENT DATE
// ============================================================
private getCurrentDate(): string {
  return new Date()
    .toISOString()
    .split('T')[0];
}


// ============================================================
// EXPORT SELECTOR
// ============================================================
onExportSelected(
  format: ExportFormat
): void {

  switch (format) {
    case 'excel':
      this.downloadExcel();
      break;

    case 'pdf':
      this.downloadReport();
      break;

    default:
      console.warn(
        `Unsupported export format: ${format}`
      );
  }
}
}