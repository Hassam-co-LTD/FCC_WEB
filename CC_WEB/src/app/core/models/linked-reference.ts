import { Observable } from 'rxjs';

/** A transaction that can be linked to another one as a reference. */
export interface LinkableTransaction {
  tnxId: string;
  createdOn?: string | Date;
  expiryDate?: string | Date;
  currency?: string;
  amount?: number;
  availableBalance?: number;
  applicantName?: string;
  beneficiaryName?: string;
}

/**
 * Loads the approved transactions offered in the Link popup.
 * Each product that can be linked provides its own source.
 */
export type LinkableTransactionSource = () => Observable<LinkableTransaction[]>;
