import { Component, PLATFORM_ID, OnInit, inject } from '@angular/core';
import { finalize, delay } from 'rxjs/operators';
import {
  CommonModule,
  isPlatformBrowser,
} from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// SERVICES
import { UndertakingIssuanceService } from '../../../../../../../core/services/user-service/Sharing-search-service/undertaking-issuance-form-transaction';
import { UndertakingGuarantee } from '../../../../../../../core/models/undertaking-lc';
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
export class inquiriesRecords implements OnInit {
  isLoading = false;
  hasLoadedData = false;

  currentPage = 1;
  itemsPerPage = 10;
  // State
  allTransactions: UndertakingGuarantee[] = [];
  filteredTransactions: UndertakingGuarantee[] = [];

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

  // Sorting
  sortColumn:
    | keyof UndertakingGuarantee
    | 'currency'
    | 'amount'
    | 'expiryDate'
    | 'createdOn' = 'createdOn';
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
          'Undertaking Issuance Permission Names:',
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
      (p) => p?.trim().toLowerCase() === permission.trim().toLowerCase(),
    );
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.loadPermissions();

    console.log('Undertaking Issuance Permissions:', this.permissionNames);
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
    // });
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
        .getUtgLiveEventHistory()
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
      .getUndertakingRecordTransactionsByStatus(backendStatus)
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

  // --- FILTERING ---

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
    // this.loadTransactions();
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

  get totalPages(): number {
    const count = Math.ceil(
      this.filteredTransactions.length / this.itemsPerPage,
    );
    return count < 1 ? 1 : count;
  }

  get pagedTransactions(): UndertakingGuarantee[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTransactions.slice(start, start + this.itemsPerPage);
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  viewTransaction(tx: UndertakingGuarantee): void {
    if (!this.hasPermission('UI_InquiryPreview')) {
      console.warn('User does not have UTG_Inquiry permission');

      return;
    }

    const readOnly = ['A', 'R'].includes(tx.status!);

    this.api.getUndertakingByTnxId(tx.tnxId!).subscribe({
      next: (freshTx) => {
        this.transactionService.setCurrentTransaction(freshTx, readOnly);
        this.router.navigate([
          '/dashboard/Trade-Services/undertaking-issuance/preview',
        ]);
      },
      error: () => {
        this.transactionService.setCurrentTransaction(tx, readOnly);
        this.router.navigate([
          '/dashboard/Trade-Services/undertaking-issuance/preview',
        ]);
      },
    });
  }

  openUtg(tx: UndertakingGuarantee) {
    if (this.activeTab === 'live') {
      // Live tab rows are event records — navigate by eventRefNo
      this.router.navigate(
        ['/dashboard/Trade-Services/undertaking-issuance/amend', tx.tnxId],
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
      ['/dashboard/Trade-Services/undertaking-issuance', tx.tnxId],
      {
        state: {
          transaction: tx,
          // showUpdateSubmit: true // flag to show buttons
          mode: mode,
        },
      },
    );
  }

  trackByTnxId(_: number, tx: UndertakingGuarantee): string {
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
      LIVE ORDER:
      0  Event Ref No
      1  TNX ID
      2  Event Sequence
      3  Event
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
        0: { cellWidth: 30 }, // Event Ref No
        1: { cellWidth: 27 }, // TNX ID
        2: { cellWidth: 18 }, // Event Sequence
        3: { cellWidth: 18 }, // Event
        4: { cellWidth: 20 }, // Created
        5: { cellWidth: 20 }, // Product
        6: { cellWidth: 20 }, // Issuer Reference
        7: { cellWidth: 20 }, // Expiry Date
        8: { cellWidth: 18 }, // Currency
        9: { cellWidth: 18, halign: 'right' }, // Undertaking Amount
        10: { cellWidth: 30, halign: 'left' }, // Applicant
        11: { cellWidth: 30, halign: 'left' }, // Beneficiary
      });
    } else {
      /*
      NON-LIVE ORDER:
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
        1: { cellWidth: 25 }, // Created
        2: { cellWidth: 24 }, // Product
        3: { cellWidth: 35 }, // Issuer Reference
        4: { cellWidth: 25 }, // Expiry Date
        5: { cellWidth: 16 }, // Currency
        6: { cellWidth: 32, halign: 'right' }, // Undertaking Amount
        7: { cellWidth: 40, halign: 'left' }, // Applicant
        8: { cellWidth: 40, halign: 'left' }, // Beneficiary
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
  // PDF HEADERS
  // Matches HTML table exactly, excluding Action
  // ============================================================
  private getReportHeaders(): string[] {
    if (this.activeTab === 'live') {
      return [
        'Event Ref No',
        'TNX ID',
        'Event Sequence',
        'Event',
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

  // ============================================================
  // PDF ROW
  // Matches HTML table exactly
  // ============================================================
  private getReportRow(tx: UndertakingGuarantee): any[] {
    if (this.activeTab === 'live') {
      return [
        tx.eventRefNo ?? '',
        tx.tnxId ?? '',
        tx.eventSequence ?? '',
        tx.eventType ?? '',
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

  // ============================================================
  // IMAGE
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
  // CURRENT DATE FOR FILE NAME
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
  // Matches HTML table exactly, excluding Action
  // ============================================================
  private getExcelRow(tx: UndertakingGuarantee): any[] {
    if (this.activeTab === 'live') {
      return [
        tx.eventRefNo ?? '',
        tx.tnxId ?? '',
        tx.eventSequence ?? '',
        tx.eventType ?? '',
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

    // =========================
    // Excel Column Widths
    // =========================
    if (this.activeTab === 'live') {
      worksheet['!cols'] = [
        { wch: 18 }, // Event Ref No
        { wch: 18 }, // TNX ID
        { wch: 18 }, // Event Sequence
        { wch: 16 }, // Event
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

    // =========================
    // Workbook
    // =========================
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Undertaking Records');

    // =========================
    // File Name
    // =========================
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
