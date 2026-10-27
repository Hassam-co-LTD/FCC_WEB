import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCard } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';

type FieldType = 'text' | 'date' | 'datetime' | 'amount' | 'boolean';

interface PreviewField {
  key: string;
  label: string;
  type?: FieldType;
}

interface PreviewSection {
  title: string;
  fields: PreviewField[];
}

interface ProductConfig {
  title: string;
  inquiriesRoute: string;
  load: (api: ApiService, tnxId: string) => Observable<any>;
  sections: PreviewSection[];
}

const SYSTEM_SECTION: PreviewSection = {
  title: 'Transaction / Backoffice',
  fields: [
    { key: 'tnxId', label: 'TNX ID' },
    { key: 'status', label: 'Status' },
    { key: 'eventType', label: 'Event Type' },
    { key: 'eventRefNo', label: 'Event Ref No' },
    { key: 'createdOn', label: 'Created On', type: 'datetime' },
    { key: 'updatedOn', label: 'Updated On', type: 'datetime' },
    { key: 'backofficeRefNo', label: 'Backoffice Ref No' },
    { key: 'backofficeDate', label: 'Backoffice Date' },
    { key: 'rejectionReason', label: 'Rejection Reason' },
  ],
};

const PRODUCTS: Record<string, ProductConfig> = {
  'import-collection': {
    title: 'Import Collection',
    inquiriesRoute: '/dashboard/Trade-Services/import-collection/inquiries',
    load: (api, tnxId) => api.getImportCollectionByTnxId(tnxId),
    sections: [
      {
        title: 'General',
        fields: [
          { key: 'customerReference', label: 'Customer Reference' },
          { key: 'advisingBankName', label: 'Advising Bank' },
          { key: 'issuerReference', label: 'Issuer Reference' },
          { key: 'currency', label: 'Currency' },
          { key: 'amount', label: 'Amount', type: 'amount' },
          { key: 'expiryDate', label: 'Expiry Date', type: 'date' },
        ],
      },
      {
        title: 'Collection Details',
        fields: [
          { key: 'documentRelease', label: 'Document Release' },
          { key: 'productType', label: 'Product Type' },
          { key: 'receivedFromReference', label: 'Received From Reference' },
          { key: 'receivedOn', label: 'Received On' },
          { key: 'collectionAmount', label: 'Collection Amount' },
          { key: 'sharedDirectory', label: 'Shared Directory', type: 'boolean' },
          { key: 'direct', label: 'Direct', type: 'boolean' },
          { key: 'multiplePayment', label: 'Multiple Payment', type: 'boolean' },
        ],
      },
      {
        title: 'Party Details',
        fields: [
          { key: 'receivedFrom', label: 'Received From' },
          { key: 'receivedFromCode', label: 'Received From Code' },
          { key: 'receivedFromName', label: 'Received From Name' },
          { key: 'receivedFromCountry', label: 'Received From Country' },
          { key: 'sendTo', label: 'Send To' },
          { key: 'sendToCode', label: 'Send To Code' },
          { key: 'sendToName', label: 'Send To Name' },
          { key: 'drawerName', label: 'Drawer Name' },
          { key: 'drawerCode', label: 'Drawer Code' },
          { key: 'drawerCountry', label: 'Drawer Country' },
        ],
      },
      {
        title: 'Draft Details',
        fields: [
          { key: 'draftCollectionCurrency', label: 'Collection Currency' },
          { key: 'draftCollectionAmount', label: 'Collection Amount' },
          { key: 'draftAgainst', label: 'Draft Against' },
          { key: 'draftIdentifier', label: 'Draft Identifier' },
          { key: 'draftText', label: 'Draft Text' },
          { key: 'draftAmount', label: 'Draft Amount' },
          { key: 'tenor', label: 'Tenor' },
        ],
      },
      {
        title: 'Interest (for late payment)',
        fields: [
          { key: 'interestRate', label: 'Interest Rate' },
          { key: 'interestStartDate', label: 'Interest Start Date' },
          { key: 'interestEndPeriod', label: 'Interest End Period' },
          { key: 'startInterest', label: 'Start Interest' },
          { key: 'dayBasis', label: 'Day Basis' },
          { key: 'startFrom', label: 'Start From' },
          { key: 'interestEndDate', label: 'Interest End Date' },
          { key: 'graceDays', label: 'Grace Days' },
          { key: 'waiveIfRefused', label: 'Waive If Refused', type: 'boolean' },
        ],
      },
      {
        title: 'Goods',
        fields: [
          { key: 'goodsCode', label: 'Goods Code' },
          { key: 'goodsDescription', label: 'Goods Description' },
          { key: 'shipmentFrom', label: 'Shipment From' },
          { key: 'shipmentTo', label: 'Shipment To' },
          { key: 'expectedDate', label: 'Expected Date' },
          { key: 'vesselAircraft', label: 'Vessel / Aircraft' },
        ],
      },
      {
        title: 'General Instruction',
        fields: [
          { key: 'urcApply', label: 'URC Apply', type: 'boolean' },
          { key: 'acknowledgeReceipt', label: 'Acknowledge Receipt', type: 'boolean' },
          { key: 'adviseAcceptance', label: 'Advise Acceptance', type: 'boolean' },
          { key: 'adviseNonAcceptance', label: 'Advise Non-Acceptance', type: 'boolean' },
          { key: 'advisePayment', label: 'Advise Payment', type: 'boolean' },
          { key: 'adviseNonPayment', label: 'Advise Non-Payment', type: 'boolean' },
          { key: 'holdDocumentsUntilArrivalOfGoods', label: 'Hold Documents Until Arrival of Goods', type: 'boolean' },
          { key: 'protestNonAcceptance', label: 'Protest Non-Acceptance', type: 'boolean' },
          { key: 'protestNonPayment', label: 'Protest Non-Payment', type: 'boolean' },
          { key: 'allowPartPayments', label: 'Allow Part Payments', type: 'boolean' },
        ],
      },
      SYSTEM_SECTION,
    ],
  },
  'export-lc': {
    title: 'Export LC',
    inquiriesRoute: '/dashboard/Trade-Services/export-screen/inquiries',
    load: (api, tnxId) => api.getExportLcByTnxId(tnxId),
    sections: [
      {
        title: 'General Details',
        fields: [
          { key: 'customerReference', label: 'Customer Reference' },
          { key: 'advisingBankName', label: 'Advising Bank' },
          { key: 'issuerReference', label: 'Issuer Reference' },
        ],
      },
      {
        title: 'Amount / Expiry',
        fields: [
          { key: 'currency', label: 'Currency' },
          { key: 'amount', label: 'Amount', type: 'amount' },
          { key: 'expiryDate', label: 'Expiry Date', type: 'date' },
          { key: 'uploadFileName', label: 'MT700 / MT701 File' },
        ],
      },
      SYSTEM_SECTION,
    ],
  },
};

/**
 * Read-only preview for products received from the middleware
 * (Import Collection, Export LC). No edit or amend actions by design.
 */
@Component({
  selector: 'app-inbound-preview',
  standalone: true,
  imports: [CommonModule, MatCard, MatIconModule, MatButtonModule],
  templateUrl: './inbound-preview.html',
  styleUrls: ['./inbound-preview.scss'],
})
export class InboundPreview implements OnInit {
  config!: ProductConfig;
  tx: any = null;
  isLoading = true;
  errorMessage = '';

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.config = PRODUCTS[this.route.snapshot.data['product']];
    if (!this.isBrowser) return;

    const tnxId = this.route.snapshot.paramMap.get('tnxId') ?? '';
    this.config.load(this.api, tnxId).subscribe({
      next: (tx) => {
        this.tx = tx;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err?.message || 'Unable to load transaction.';
        this.isLoading = false;
      },
    });
  }

  downloadAttachment(attachment: { fileName: string; file: string | Blob }): void {
    const blob =
      attachment.file instanceof Blob
        ? attachment.file
        : this.base64ToBlob(attachment.file);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = attachment.fileName || 'file';
    link.click();
    window.URL.revokeObjectURL(link.href);
  }

  back(): void {
    this.router.navigate([this.config.inquiriesRoute]);
  }

  private base64ToBlob(base64: string): Blob {
    // Accept both raw Base64 and data URLs ("data:application/pdf;base64,....")
    const [meta, data] = base64.includes(',') ? base64.split(',', 2) : ['', base64];
    const type = meta.match(/data:(.*?);/)?.[1] ?? 'application/octet-stream';
    const bytes = atob(data);
    const buffer = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      buffer[i] = bytes.charCodeAt(i);
    }
    return new Blob([buffer], { type });
  }
}
