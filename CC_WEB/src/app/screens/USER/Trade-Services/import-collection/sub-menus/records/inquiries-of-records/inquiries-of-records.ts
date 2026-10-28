import { Component, PLATFORM_ID, OnInit, inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
 
import {
  ExportDropdown,
  ExportFormat,
} from '../../../../../../../shared/export-dropdown/export-dropdown';
 
import { ImportCollectionTransaction } from '../../../../../../../core/models/import-collection';
import { ApiService } from '../../../../../../../core/services/api.service';
import { getSessionItem } from '../../../../../../../core/utils/browser-storage';
@Component({
  selector: 'app-inquiries-of-records',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    ExportDropdown
  ],
  templateUrl: './inquiries-of-records.html',
  styleUrls: ['./inquiries-of-records.scss'],
})
export class InquiriesOfRecords implements OnInit {
  isLoading = false;
  hasLoadedData = false;
 
  currentPage = 1;
  itemsPerPage = 10;
  allTransactions: ImportCollectionTransaction[] = [];
  filteredTransactions: ImportCollectionTransaction[] = [];
  showAdvanced = false;
  searchQuery = '';
  advisingBankFilter = '';
  permissionNames: string[] = [];
 
  hasPermission(permission: string): boolean {
    return this.permissionNames.some(
      (p) => p.trim().toLowerCase() === permission.toLowerCase(),
    );
  }
 
  sortColumn:
    | keyof ImportCollectionTransaction
    | 'currency'
    | 'amount'
    | 'expiryDate'
    | 'createdOn' = 'createdOn';
  sortDirection: 'asc' | 'desc' = 'desc';
 
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
 
  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}
 
  ngOnInit(): void {
    if (!this.isBrowser) return;
    const storedPermissions = getSessionItem('permissionNames');
    if (storedPermissions) {
      try {
        this.permissionNames = JSON.parse(storedPermissions);
      } catch {
        this.permissionNames = [];
      }
    }
    console.log('Import Collection Permissions:', this.permissionNames);
 
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
 
     this.api
       .getImportCollectionRecords()
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
           console.error(
             'Failed to load records:',
             error,
           );
 
           this.allTransactions = [];
           this.filteredTransactions = [];
         },
       });
 
    // if (this.activeTab === 'live') {
    //   this.api.getLiveEventHistory().subscribe({
    //     next: (txList) => {
    //       this.allTransactions = txList;
    //       this.applyFilters();
    //       // this.filteredTransactions = [...txList];
    //     },
    //     error: () => {
    //       this.allTransactions = [];
    //       this.filteredTransactions = [];
    //     },
    //   });
 
    //   return;
    // }
 
    // const backendStatus = this.mapTabToBackendStatus(this.activeTab);
 
    // this.api.getRecordTransactionsByStatus(backendStatus).subscribe({
    //   next: (txList) => {
    //     this.allTransactions = txList;
    //     this.applyFilters();
    //   },
    //   error: () => {
    //     this.allTransactions = [];
    //     this.filteredTransactions = [];
    //   },
    // });
  }
 
  applyFilters(): void {
    const query = this.searchQuery.toLowerCase().trim();
    const advisingBank = this.advisingBankFilter.toLowerCase().trim();
 
    const filtered = this.allTransactions.filter((tx) => {
      const matchesSearch =
        !query ||
        tx.tnxId?.toLowerCase().includes(query) ||
        tx.customerReference?.toLowerCase().includes(query) ||
        tx.advisingBankName?.toLowerCase().includes(query) ||
        tx.issuerReference?.toLowerCase().includes(query);
 
      const matchesAdvisingBank =
        !advisingBank ||
        tx.advisingBankName?.toLowerCase().includes(advisingBank);
 
      return matchesSearch && matchesAdvisingBank;
    });
 
    this.applySorting(filtered);
  }
 
  // setActiveTab(tab: string): void {
  //   this.activeTab = tab;
  //   this.applyFilters();
  // }
 
  // 
  // private loadByStatus(status: string): void {
  //   const backendStatus = this.mapTabToBackendStatus(status);
  //   this.api.getTransactionsByStatus(backendStatus).subscribe({
  //     next: (txList) => {
  //       this.allTransactions = txList;
  //       this.filteredTransactions = txList;
  //     },
  //     error: () => {
  //       this.allTransactions = [];
  //       this.filteredTransactions = [];
  //     }
  //   });
  // }
 
  // getTabCount(tabKey: string): number {
  //   return this.allTransactions.filter(tx => this.mapStatusToTab(tx.status!) === tabKey).length;
  // }
 
  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }
 
  // clearCurrency(): void {
  //   this.advisingBankFilter = '';
  //   this.applyFilters();
  // }
 
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
    source: ImportCollectionTransaction[] = this.allTransactions,
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
 
  private resolveColumn(tx: ImportCollectionTransaction, column: string): any {
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
 
  get totalPages(): number {
    const count = Math.ceil(
      this.filteredTransactions.length / this.itemsPerPage,
    );
    return count < 1 ? 1 : count;
  }
 
  get pagedTransactions(): ImportCollectionTransaction[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTransactions.slice(start, start + this.itemsPerPage);
  }
 
  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }
 
  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }
 
  // viewTransaction(tx: ImportCollectionTransaction): void {
  //   this.transactionService.setCurrentTransaction(tx, true);
  //   this.router.navigate(['/import-collection/preview']);
  // }
  // Import Collection is preview-only: received from the middleware, never edited or amended
  viewTransaction(tx: ImportCollectionTransaction): void {
    if (!this.hasPermission('ILC_InquiryPreview')) {
      return;
    }

    this.router.navigate([
      '/dashboard/Trade-Services/import-collection/view',
      tx.tnxId,
    ]);
  }

  trackByTnxId(_: number, tx: ImportCollectionTransaction): string {
    return tx.tnxId!;
  }

  // I / S / A / R from the bank feed -> readable label
  statusLabel(status?: string): string {
    switch ((status ?? '').toUpperCase()) {
      case 'I':
        return 'Pending';
      case 'S':
        return 'Submitted';
      case 'A':
        return 'Approved';
      case 'R':
        return 'Rejected';
      default:
        return status ?? '';
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
 
    const reportTitle = 'Import Collection Records Report';
    const statusTitle = 'ALL';
 
    // =========================
    // Status color
    // =========================
    const statusColor: [number, number, number] = [108, 117, 125];
 
    // =========================
    // Top Header
    // =========================
    doc.setFillColor(...primaryColor);
 
    doc.rect(0, 0, pageWidth, 20, 'F');
 
    try {
      const logo = await this.loadImageAsDataURL('/branding/tradefinance-logo-white.png');
 
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
      this.searchQuery?.trim() || this.advisingBankFilter?.trim() ? 27 : 19;
 
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
 
    if (this.advisingBankFilter?.trim()) {
      if (filterText) {
        filterText += '  |  ';
      }
 
      filterText += `Advising Bank: ${this.advisingBankFilter.trim()}`;
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
 
    Object.assign(columnStyles, {
      0: { cellWidth: 28 }, // TNX ID
      1: { cellWidth: 23 }, // Created
      2: { cellWidth: 22 }, // Status
      3: { cellWidth: 45 }, // Customer Reference
      4: { cellWidth: 55 }, // Advising Bank
      5: { cellWidth: 45 }, // Issuer Reference
    });
 
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
 
      // Prevent awkward row splitting
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
 
        doc.text('Import Collection Records', 10, pageHeight - 7);
 
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
    const fileName = `ImportCollection_Report_${this.getCurrentDate()}.pdf`;
 
    doc.save(fileName);
  }
 
  private getReportHeaders(): string[] {
    return [
      'TNX ID',
      'Created',
      'Status',
      'Customer Reference',
      'Advising Bank',
      'Issuer Reference',
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
 
  private getReportRow(tx: ImportCollectionTransaction): any[] {
    return [
      tx.tnxId ?? '',
      this.formatReportDate(tx.createdOn),
      this.statusLabel(tx.status),
      tx.customerReference ?? '',
      tx.advisingBankName ?? '',
      tx.issuerReference ?? '',
    ];
  }
 
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
 
  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }
 
  // downloadReport(): void {
  //   if (!this.filteredTransactions.length) {
  //     return;
  //   }
 
  //   const headers = this.getReportHeaders();
 
  //   const rows = this.filteredTransactions.map((tx) => this.getReportRow(tx));
 
  //   const csvContent = [headers, ...rows]
  //     .map((row) => row.map((value) => this.escapeCsvValue(value)).join(','))
  //     .join('\n');
 
  //   const blob = new Blob(['\ufeff' + csvContent], {
  //     type: 'text/csv;charset=utf-8;',
  //   });
 
  //   const url = window.URL.createObjectURL(blob);
 
  //   const link = document.createElement('a');
 
  //   link.href = url;
 
  //   link.download = `ImportCollection_Report_${this.getCurrentDate()}.csv`;
 
  //   document.body.appendChild(link);
 
  //   link.click();
 
  //   document.body.removeChild(link);
 
  //   window.URL.revokeObjectURL(url);
  // }
 
  // private getReportHeaders(): string[] {
  //   const commonHeaders = [
  //     'TNX ID',
  //     'Created',
  //     'Product',
  //     'Issuer Reference',
  //     'Expiry Date',
  //     'Currency',
  //     'Amount',
  //     'Applicant',
  //     'Beneficiary',
  //   ];
 
  //   if (this.activeTab === 'live') {
  //     return [
  //       'Event Ref No',
  //       'TNX ID',
  //       'Event Sequence',
  //       'Event',
  //       'Created',
  //       'Product',
  //       'Issuer Reference',
  //       'Expiry Date',
  //       'Currency',
  //       'Amount',
  //       'Applicant',
  //       'Beneficiary',
  //     ];
  //   }
 
  //   return commonHeaders;
  // }
 
  // private getReportRow(tx: ImportCollectionTransaction): any[] {
  //   const commonData = [
  //     tx.tnxId ?? '',
  //     tx.createdOn ? new Date(tx.createdOn).toISOString().split('T')[0] : '',
  //     tx.productType ?? '',
  //     tx.issuerReference ?? '',
  //     tx.expiryDate ?? '',
  //     tx.currency ?? '',
  //     tx.amount ?? '',
  //     tx.applicantName ?? '',
  //     tx.beneficiaryName ?? '',
  //   ];
 
  //   if (this.activeTab === 'live') {
  //     return [
  //       tx.eventRefNo ?? '',
  //       tx.tnxId ?? '',
  //       tx.eventSequence ?? '',
  //       tx.eventType ?? '',
  //       tx.createdOn ? new Date(tx.createdOn).toISOString().split('T')[0] : '',
  //       tx.productType ?? '',
  //       tx.issuerReference ?? '',
  //       tx.expiryDate ?? '',
  //       tx.currency ?? '',
  //       tx.amount ?? '',
  //       tx.applicantName ?? '',
  //       tx.beneficiaryName ?? '',
  //     ];
  //   }
 
  //   return commonData;
  // }
 
  // private escapeCsvValue(value: any): string {
  //   if (value === null || value === undefined) {
  //     return '';
  //   }
 
  //   const stringValue = String(value);
 
  //   return `"${stringValue.replace(/"/g, '""')}"`;
  // }
 
  // private getCurrentDate(): string {
  //   return new Date().toISOString().split('T')[0];
  // }
 
  private getExcelRow(tx: ImportCollectionTransaction): any[] {
    return [
      tx.tnxId ?? '',
      tx.createdOn ?? '',
      this.statusLabel(tx.status),
      tx.customerReference ?? '',
      tx.advisingBankName ?? '',
      tx.issuerReference ?? '',
    ];
  }
 
  private downloadExcel(): void {
    if (!this.filteredTransactions.length) {
      return;
    }
 
    const headers = this.getReportHeaders();
 
    const rows = this.filteredTransactions.map((tx) => this.getExcelRow(tx));
 
    const worksheetData = [headers, ...rows];
 
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
 
    const workbook = XLSX.utils.book_new();
 
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Import Collection Records');
 
    const fileName = `ImportCollection_Report_${this.getCurrentDate()}.xlsx`;
 
    XLSX.writeFile(workbook, fileName);
  }
 
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
 