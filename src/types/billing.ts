export type DocumentType = 'Invoice' | 'Quotation';

export type PaymentStatus = 'Draft' | 'Unpaid' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled';

export type CurrencyCode = 'BDT' | 'USD' | 'EUR' | 'GBP' | 'AED';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToBDT: number; // For multi-currency estimation
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  serviceCategory?: string;
}

export interface ClientDetails {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string; // TIN or BIN
}

export interface BankPaymentDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchName?: string;
  routingNumber?: string;
  swiftCode?: string;
}

export interface MobileBankingDetails {
  bKashNumber?: string;
  bKashType?: 'Personal' | 'Merchant';
  nagadNumber?: string;
  rocketNumber?: string;
}

export interface AgencySettings {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  taxNumber: string; // BIN / TIN / VAT reg
  currency: CurrencyCode;
  bankDetails: BankPaymentDetails;
  mobileBanking: MobileBankingDetails;
  defaultPaymentTerms: string;
  defaultNotes: string;
  invoicePrefix: string;
  quotationPrefix: string;
}

export interface DocumentTotals {
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxableAmount: number;
  taxPercent: number;
  taxAmount: number;
  shippingOrFee: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
}

export interface BillingDocument {
  id: string;
  type: DocumentType;
  number: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string;   // YYYY-MM-DD
  currency: CurrencyCode;
  paymentStatus: PaymentStatus;
  client: ClientDetails;
  items: LineItem[];
  discountPercent: number;
  taxPercent: number;
  shippingOrFee: number;
  amountPaid: number;
  paymentTerms: string;
  notes: string;
  terms: string;
  agencySnapshot: AgencySettings;
  totals: DocumentTotals;
  createdAt: string;
  updatedAt: string;
  convertedFromQuoteId?: string;
}

export interface PresetService {
  title: string;
  category: string;
  defaultRate: number;
  description: string;
}
