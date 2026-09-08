import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { finalize, delay } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../../../../core/services/api.service';
import { UndertakingGuarantee } from '../../../../../../../core/models/undertaking-lc';
import { UndertakingIssuanceService } from '../../../../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';
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
  allTransactions: UndertakingGuarantee[] = [];
  filteredTransactions: UndertakingGuarantee[] = [];
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
  sortColumn: keyof UndertakingGuarantee = 'createdOn';
  sortDirection: 'asc' | 'desc' = 'desc';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  constructor(
    private api: ApiService,
    private transactionService: UndertakingIssuanceService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}
  permissionNames: string[] = [];
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

  hasPermission(permission: string): boolean {
    return this.permissionNames.some(
      (p) => p.trim().toLowerCase() === permission.trim().toLowerCase(),
    );
  }

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
      // this.currentPage = 1;
      // this.loadApprovedTransactions();
    });
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
        .getApprovedUtgMasterLcRecords()
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
    const backend = this.mapTabToBackendStatus(this.activeTab);
    this.api
      .getUtgAmendRecordsByStatus(backend)
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
          // this.filteredTransactions = [...this.allTransactions];
          // this.currentPage = 1;
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

  get pagedTransactions(): UndertakingGuarantee[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTransactions.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    const count = Math.ceil(
      this.filteredTransactions.length / this.itemsPerPage,
    );
    return count < 1 ? 1 : count;
  }
  applyFilters(): void {
    const query = this.searchQuery.toLowerCase().trim();
    const currency = this.currencyFilter.toLowerCase().trim();

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
    source: UndertakingGuarantee[] = this.allTransactions,
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

    this.filteredTransactions = sorted;
    this.currentPage = 1;
  }

  private resolveColumn(tx: UndertakingGuarantee, column: string): any {
    switch (column) {
      case 'tnxId':
        return tx.tnxId;
      case 'currency':
        return tx.currency;
      case 'undertakingAmount':
        return tx.undertakingAmount;
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

    this.allTransactions = [];
    this.filteredTransactions = [];

    this.hasLoadedData = false;
  }

  // simple sorting helper
  toggleSort(column: keyof UndertakingGuarantee): void {
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

  trackByTnxId(_: number, tx: UndertakingGuarantee): string {
    return tx.tnxId!;
  }

  viewTransaction(tx: UndertakingGuarantee): void {
    if (!this.hasPermission('UI_AmendPreview')) {
      return;
    }

    const readOnly = ['A', 'R'].includes(tx.status!);

    this.api.getUtgAmendmentByTnxId(tx.tnxId!).subscribe({
      next: (freshTx) => {
        this.transactionService.setCurrentTransaction(freshTx, readOnly);
        this.router.navigate([
          '/dashboard/Trade-Services/undertaking-issuance/amend/preview',
        ]);
      },
      error: () => {
        this.transactionService.setCurrentTransaction(tx, readOnly);
        this.router.navigate([
          '/dashboard/Trade-Services/undertaking-issuance/amend/preview',
        ]);
      },
    });
  }

  openApprovedAmendTransaction(tx: UndertakingGuarantee): void {
    // Navigate to import screen
    this.router.navigate(
      ['/dashboard/Trade-Services/undertaking-issuance/amend', tx.tnxId],
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

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
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

    const reportTitle = 'Undertaking Records Report';
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

    const infoBoxHeight =
      this.searchQuery?.trim() || this.currencyFilter?.trim() ? 27 : 19;

    doc.setFillColor(...secondaryColor);

    doc.roundedRect(10, infoBoxY, pageWidth - 20, infoBoxHeight, 3, 3, 'F');

    // =========================
    // Information Labels
    // =========================
    doc.setTextColor(...mutedTextColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    doc.text('Generated', 15, infoBoxY + 7);

    doc.text('Total Records', 95, infoBoxY + 7);

    doc.text('Status', 180, infoBoxY + 7);

    // =========================
    // Information Values
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

      doc.text(filterText, 15, infoBoxY + 22, {
        maxWidth: pageWidth - 30,
      });
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
      /*
      LIVE HTML ORDER:

      0  TNX ID
      1  Created
      2  Product
      3  Issuer Reference
      4  Expiry Date
      5  Currency
      6  Undertaking Amount
      7  Applicant
      8  Beneficiary
    */

      Object.assign(columnStyles, {
        0: { cellWidth: 30 }, // TNX ID
        1: { cellWidth: 23 }, // Created
        2: { cellWidth: 22 }, // Product
        3: { cellWidth: 35 }, // Issuer Reference
        4: { cellWidth: 24 }, // Expiry Date
        5: { cellWidth: 15 }, // Currency
        6: { cellWidth: 30, halign: 'right' }, // Undertaking Amount
        7: { cellWidth: 40, halign: 'left' }, // Applicant
        8: { cellWidth: 40, halign: 'left' }, // Beneficiary
      });
    } else {
      /*
      NON-LIVE HTML ORDER:

      0  TNX ID
      1  Event
      2  Event Ref No
      3  Event Sequence
      4  Created
      5  Product
      6  Issuer Reference
      7  Expiry Date
      8  Currency
      9  Undertaking Amount
      10 Applicant
      11 Beneficiary
    */

      Object.assign(columnStyles, {
        0: { cellWidth: 25 }, // TNX ID
        1: { cellWidth: 15 }, // Event
        2: { cellWidth: 30 }, // Event Ref No
        3: { cellWidth: 18 }, // Event Sequence
        4: { cellWidth: 20 }, // Created
        5: { cellWidth: 20 }, // Product
        6: { cellWidth: 25 }, // Issuer Reference
        7: { cellWidth: 22 }, // Expiry Date
        8: { cellWidth: 15 }, // Currency
        9: { cellWidth: 25, halign: 'right' }, // Undertaking Amount
        10: { cellWidth: 30, halign: 'left' }, // Applicant
        11: { cellWidth: 30, halign: 'left' }, // Beneficiary
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

      // =========================
      // Footer
      // =========================
      didDrawPage: () => {
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.3);

        doc.line(10, pageHeight - 13, pageWidth - 10, pageHeight - 13);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...mutedTextColor);

        doc.text('Undertaking Records', 10, pageHeight - 7);

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
    const fileName = `Undertaking_${this.activeTab}_Report_${this.getCurrentDate()}.pdf`;

    doc.save(fileName);
  }

  // ============================================================
  // REPORT HEADERS
  // ============================================================
  private getReportHeaders(): string[] {
    // HTML LIVE:
    //
    // TNX ID
    // Created
    // Product
    // Issuer Reference
    // Expiry Date
    // Currency
    // Undertaking Amount
    // Applicant
    // Beneficiary

    if (this.activeTab === 'live') {
      return [
        'TNX ID',
        'Created',
        'Product',
        'Issuer Reference',
        'Expiry Date',
        'Currency',
        'Undertaking Amount',
        'Applicant',
        'Beneficiary',
      ];
    }

    // HTML NON-LIVE:
    //
    // TNX ID
    // Event
    // Event Ref No
    // Event Sequence
    // Created
    // Product
    // Issuer Reference
    // Expiry Date
    // Currency
    // Undertaking Amount
    // Applicant
    // Beneficiary

    return [
      'TNX ID',
      'Event',
      'Event Ref No',
      'Event Sequence',
      'Created',
      'Product',
      'Issuer Reference',
      'Expiry Date',
      'Currency',
      'Undertaking Amount',
      'Applicant',
      'Beneficiary',
    ];
  }

  // ============================================================
  // LOAD LOGO
  // ============================================================
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
  // ============================================================
  private getReportRow(tx: UndertakingGuarantee): any[] {
    // ==========================================================
    // LIVE
    // ==========================================================
    if (this.activeTab === 'live') {
      return [
        tx.tnxId ?? '',
        this.formatReportDate(tx.createdOn),
        tx.productType ?? '',
        tx.issuerReference ?? '',
        this.formatReportDate(tx.expiryDate),
        tx.currency ?? '',
        this.formatReportAmount(tx.undertakingAmount),
        tx.applicantName ?? '',
        tx.beneficiaryName ?? '',
      ];
    }

    // ==========================================================
    // NON-LIVE
    // ==========================================================
    return [
      tx.tnxId ?? '',
      tx.eventType ?? '',
      tx.eventRefNo ?? '',
      tx.eventSequence ?? '',
      this.formatReportDate(tx.createdOn),
      tx.productType ?? '',
      tx.issuerReference ?? '',
      this.formatReportDate(tx.expiryDate),
      tx.currency ?? '',
      this.formatReportAmount(tx.undertakingAmount),
      tx.applicantName ?? '',
      tx.beneficiaryName ?? '',
    ];
  }

  // ============================================================
  // AMOUNT FORMAT
  // ============================================================
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

  // ============================================================
  // DATE FORMAT
  // Matches HTML:
  // {{ tx.createdOn | date:'yyyy-MM-dd' }}
  // ============================================================
  private formatReportDate(date: any): string {
    if (!date) {
      return '';
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return String(date);
    }

    const year = parsedDate.getFullYear();

    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');

    const day = String(parsedDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // ============================================================
  // CURRENT DATE
  // ============================================================
  private getCurrentDate(): string {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(now.getMonth() + 1).padStart(2, '0');

    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // ============================================================
  // EXCEL ROW
  // ============================================================
  private getExcelRow(tx: UndertakingGuarantee): any[] {
    // ==========================================================
    // LIVE
    // ==========================================================
    if (this.activeTab === 'live') {
      return [
        tx.tnxId ?? '',
        this.formatReportDate(tx.createdOn),
        tx.productType ?? '',
        tx.issuerReference ?? '',
        this.formatReportDate(tx.expiryDate),
        tx.currency ?? '',
        tx.undertakingAmount ?? '',
        tx.applicantName ?? '',
        tx.beneficiaryName ?? '',
      ];
    }

    // ==========================================================
    // NON-LIVE
    // ==========================================================
    return [
      tx.tnxId ?? '',
      tx.eventType ?? '',
      tx.eventRefNo ?? '',
      tx.eventSequence ?? '',
      this.formatReportDate(tx.createdOn),
      tx.productType ?? '',
      tx.issuerReference ?? '',
      this.formatReportDate(tx.expiryDate),
      tx.currency ?? '',
      tx.undertakingAmount ?? '',
      tx.applicantName ?? '',
      tx.beneficiaryName ?? '',
    ];
  }

  // ============================================================
  // EXCEL DOWNLOAD
  // ============================================================
  private downloadExcel(): void {
    if (!this.filteredTransactions.length) {
      return;
    }

    const headers = this.getReportHeaders();

    const rows = this.filteredTransactions.map((tx) => this.getExcelRow(tx));

    const worksheetData = [headers, ...rows];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // ==========================================================
    // Excel Column Widths
    // ==========================================================
    if (this.activeTab === 'live') {
      worksheet['!cols'] = [
        { wch: 18 }, // TNX ID
        { wch: 14 }, // Created
        { wch: 16 }, // Product
        { wch: 24 }, // Issuer Reference
        { wch: 14 }, // Expiry Date
        { wch: 12 }, // Currency
        { wch: 20 }, // Undertaking Amount
        { wch: 25 }, // Applicant
        { wch: 25 }, // Beneficiary
      ];
    } else {
      worksheet['!cols'] = [
        { wch: 18 }, // TNX ID
        { wch: 16 }, // Event
        { wch: 20 }, // Event Ref No
        { wch: 18 }, // Event Sequence
        { wch: 14 }, // Created
        { wch: 16 }, // Product
        { wch: 24 }, // Issuer Reference
        { wch: 14 }, // Expiry Date
        { wch: 12 }, // Currency
        { wch: 20 }, // Undertaking Amount
        { wch: 25 }, // Applicant
        { wch: 25 }, // Beneficiary
      ];
    }

    // ==========================================================
    // Workbook
    // ==========================================================
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Undertaking Records');

    // ==========================================================
    // File Name
    // ==========================================================
    const fileName = `Undertaking_${this.activeTab}_Report_${this.getCurrentDate()}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  }

  // ============================================================
  // EXPORT DROPDOWN
  // ============================================================
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
