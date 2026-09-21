import { Component, PLATFORM_ID, OnInit, inject } from '@angular/core';
import { finalize, delay } from 'rxjs/operators';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { ExportCollectionFormTransactionService } from '../../../../../../../core/services/user-service/export-collection-form-transaction-service/export-collection-form-transaction';

import { ExportCollectionTransaction } from '../../../../../../../core/models/export-collection';
import { ApiService } from '../../../../../../../core/services/api.service';
import {
  ExportDropdown,
  ExportFormat,
} from '../../../../../../../shared/export-dropdown/export-dropdown';

@Component({
  selector: 'app-inquiries-records',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, ExportDropdown],
  templateUrl: './inquiries-records.html',
  styleUrls: ['./inquiries-records.scss'],
})
export class InquiriesRecords implements OnInit {
  isLoading = false;
  hasLoadedData = false;

  currentPage = 1;
  itemsPerPage = 10;

  allTransactions: ExportCollectionTransaction[] = [];
  filteredTransactions: ExportCollectionTransaction[] = [];

  showAdvanced = false;
  searchQuery = '';
  currencyFilter = '';
  activeTab = 'pending';

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
    { key: 'live', label: 'Live' },
    { key: 'pending', label: 'Pending' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  sortColumn:
    | keyof ExportCollectionTransaction
    | 'currency'
    | 'amount'
    | 'expiryDate'
    | 'createdOn' = 'createdOn';
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

    // =========================================================
    // LOAD USER PERMISSIONS
    // =========================================================

    const storedPermissions = sessionStorage.getItem('permissionNames');

    if (storedPermissions) {
      try {
        this.permissionNames = JSON.parse(storedPermissions);
      } catch {
        this.permissionNames = [];
      }
    }

    console.log('Export Collection Permissions:', this.permissionNames);

    this.route.queryParamMap.subscribe((params) => {
      const tab = params.get('tab');
      if (tab && this.tabs.some((t) => t.key === tab)) {
        this.activeTab = tab;
      }

      this.hasLoadedData = false;
      this.allTransactions = [];
      this.filteredTransactions = [];
    });
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
      this.api
        .getLiveEventHistoryExportCollection()
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
            console.error('Failed to load live transactions:', error);

            this.allTransactions = [];
            this.filteredTransactions = [];
          },
        });

      return;
    }

    const backendStatus = this.mapTabToBackendStatus(this.activeTab);

    this.api
      .getRecordTransactionsByStatusExportCollection(backendStatus)
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

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  sortBy(column: typeof this.sortColumn): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.applyFilters();
  }

  private applySorting(
    source: ExportCollectionTransaction[] = this.allTransactions,
  ): void {
    const sorted = [...source].sort((a, b) => {
      let aVal = this.resolveColumn(a, this.sortColumn);
      let bVal = this.resolveColumn(b, this.sortColumn);

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (aVal instanceof Date && bVal instanceof Date) {
        return this.sortDirection === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal);
      const bStr = String(bVal);

      return this.sortDirection === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    this.filteredTransactions = sorted;
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

  get totalPages(): number {
    const count = Math.ceil(
      this.filteredTransactions.length / this.itemsPerPage,
    );

    return count < 1 ? 1 : count;
  }

  get pagedTransactions(): ExportCollectionTransaction[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;

    return this.filteredTransactions.slice(start, start + this.itemsPerPage);
  }

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

  viewTransaction(tx: ExportCollectionTransaction): void {
    const readOnly = ['A', 'R'].includes(tx.status!);

    this.api.getTransactionByTnxIdExportCollection(tx.tnxId!).subscribe({
      next: (freshTx) => {
        this.transactionService.setCurrentTransaction(freshTx, readOnly);

        this.router.navigate([
          'dashboard/Trade-Services/export-collection/preview',
        ]);
      },

      error: () => {
        this.transactionService.setCurrentTransaction(tx, readOnly);

        this.router.navigate([
          'dashboard/Trade-Services/export-collection/preview',
        ]);
      },
    });
  }

  openExportCollection(tx: ExportCollectionTransaction) {
    if (!this.hasPermission('EC_Amend')) {
      return;
    }

    if (this.activeTab === 'live') {
      this.router.navigate(
        ['dashboard/Trade-Services/export-collection/amend', tx.tnxId],
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

    const mode = this.resolveScreenMode(this.activeTab);

    this.router.navigate(
      ['dashboard/Trade-Services/export-collection', tx.tnxId],
      {
        state: {
          transaction: tx,
          mode: mode,
        },
      },
    );
  }

  trackByTnxId(_: number, tx: ExportCollectionTransaction): string {
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
    const logo = await this.loadImageAsDataURL(
      '/branding/infotech-logo.jpg'
    );

    const logoWidth = 28;
    const logoHeight = (logo.height / logo.width) * logoWidth;

    doc.addImage(
      logo.dataUrl,
      'PNG',
      10,
      10 - logoHeight / 2,
      logoWidth,
      logoHeight
    );
  } catch (error) {
    console.error('Unable to load report logo:', error);
  }

  // Report title
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
  // Report Information Box
  // =========================
  const infoBoxY = 25;

  const hasFilters =
    !!this.searchQuery?.trim() ||
    !!this.currencyFilter?.trim();

  const infoBoxHeight = hasFilters ? 27 : 19;

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

  doc.text('Generated', 15, infoBoxY + 7);
  doc.text('Total Records', 95, infoBoxY + 7);
  doc.text('Status', 180, infoBoxY + 7);

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
  const headers = this.getReportHeaders();

  const rows = this.filteredTransactions.map((tx) =>
    this.getReportRow(tx)
  );

  // =========================
  // Column Styles
  // =========================
  const columnStyles: { [key: number]: any } = {};

  if (this.activeTab === 'live') {
    Object.assign(columnStyles, {
      0: {
        cellWidth: 31,
        halign: 'left',
      }, // Event Ref No

      1: {
        cellWidth: 27,
        halign: 'left',
      }, // TNX ID

      2: {
        cellWidth: 18,
        halign: 'center',
      }, // Event Sequence

      3: {
        cellWidth: 22,
        halign: 'left',
      }, // Event

      4: {
        cellWidth: 25,
        halign: 'center',
      }, // Created

      5: {
        cellWidth: 35,
        halign: 'left',
      }, // Issuer Reference

      6: {
        cellWidth: 18,
        halign: 'center',
      }, // Currency

      7: {
        cellWidth: 28,
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
  } else {
    Object.assign(columnStyles, {
      0: {
        cellWidth: 30,
        halign: 'left',
      }, // TNX ID

      1: {
        cellWidth: 27,
        halign: 'center',
      }, // Created

      2: {
        cellWidth: 38,
        halign: 'left',
      }, // Issuer Reference

      3: {
        cellWidth: 18,
        halign: 'center',
      }, // Currency

      4: {
        cellWidth: 28,
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
        `Generated: ${this.formatReportDate(new Date())}`,
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


// ======================================================
// PDF / EXCEL HEADERS
// Matches HTML table exactly
// ======================================================
private getReportHeaders(): string[] {
  if (this.activeTab === 'live') {
    return [
      'Event Ref No',
      'TNX ID',
      'Event Sequence',
      'Event',
      'Created',
      'Issuer Reference',
      'Currency',
      'Amount',
      'Drawer',
      'Drawee',
    ];
  }

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


// ======================================================
// PDF ROW
// Matches HTML table fields exactly
// ======================================================
private getReportRow(
  tx: ExportCollectionTransaction
): any[] {
  if (this.activeTab === 'live') {
    return [
      tx.eventRefNo ?? '',
      tx.tnxId ?? '',
      tx.eventSequence ?? '',
      tx.eventType ?? '',
      this.formatReportDate(tx.createdOn),
      tx.issuerReference ?? '',
      tx.currency ?? '',
      this.formatReportAmount(tx.amount),
      tx.drawerName ?? '',
      tx.draweeName ?? '',
    ];
  }

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


// ======================================================
// EXCEL ROW
// Matches HTML table fields exactly
// ======================================================
private getExcelRow(
  tx: ExportCollectionTransaction
): any[] {
  if (this.activeTab === 'live') {
    return [
      tx.eventRefNo ?? '',
      tx.tnxId ?? '',
      tx.eventSequence ?? '',
      tx.eventType ?? '',
      this.formatReportDate(tx.createdOn),
      tx.issuerReference ?? '',
      tx.currency ?? '',
      this.formatReportAmount(tx.amount),
      tx.drawerName ?? '',
      tx.draweeName ?? '',
    ];
  }

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


// ======================================================
// EXCEL DOWNLOAD
// ======================================================
private downloadExcel(): void {
  if (!this.filteredTransactions.length) {
    return;
  }

  const headers = this.getReportHeaders();

  const rows = this.filteredTransactions.map((tx) =>
    this.getExcelRow(tx)
  );

  const worksheetData = [
    headers,
    ...rows,
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(
    worksheetData
  );

  // =========================
  // Excel Column Widths
  // =========================
  if (this.activeTab === 'live') {
    worksheet['!cols'] = [
      { wch: 25 }, // Event Ref No
      { wch: 20 }, // TNX ID
      { wch: 16 }, // Event Sequence
      { wch: 18 }, // Event
      { wch: 15 }, // Created
      { wch: 28 }, // Issuer Reference
      { wch: 12 }, // Currency
      { wch: 18 }, // Amount
      { wch: 35 }, // Drawer
      { wch: 35 }, // Drawee
    ];
  } else {
    worksheet['!cols'] = [
      { wch: 20 }, // TNX ID
      { wch: 15 }, // Created
      { wch: 28 }, // Issuer Reference
      { wch: 12 }, // Currency
      { wch: 18 }, // Amount
      { wch: 35 }, // Drawer
      { wch: 35 }, // Drawee
    ];
  }

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Export Collection'
  );

  const fileName =
    `Export_Collection_${this.activeTab}_Report_${this.getCurrentDate()}.xlsx`;

  XLSX.writeFile(
    workbook,
    fileName
  );
}


// ======================================================
// AMOUNT FORMATTER
// ======================================================
private formatReportAmount(amount: any): string {
  if (
    amount === null ||
    amount === undefined ||
    amount === ''
  ) {
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


// ======================================================
// DATE FORMATTER
// ======================================================
private formatReportDate(date: any): string {
  if (!date) {
    return '';
  }

  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return String(date);
  }

  const day = String(
    parsedDate.getDate()
  ).padStart(2, '0');

  const month = parsedDate.toLocaleString(
    'en-US',
    {
      month: 'short',
    }
  );

  const year = parsedDate.getFullYear();

  return `${day}-${month}-${year}`;
}


// ======================================================
// CURRENT DATE
// ======================================================
private getCurrentDate(): string {
  return new Date()
    .toISOString()
    .split('T')[0];
}


// ======================================================
// EXPORT SELECTOR
// ======================================================
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
