import type {
  AgencySettings,
  BillingDocument,
  CurrencyCode,
  CurrencyConfig,
  DocumentTotals,
  DocumentType,
  LineItem,
  PaymentStatus,
  PresetService,
} from '../types/billing';

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  BDT: {
    code: 'BDT',
    symbol: '৳',
    name: 'Bangladeshi Taka (BDT)',
    rateToBDT: 1,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar (USD)',
    rateToBDT: 120,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro (EUR)',
    rateToBDT: 130,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound (GBP)',
    rateToBDT: 152,
  },
  AED: {
    code: 'AED',
    symbol: 'AED',
    name: 'UAE Dirham (AED)',
    rateToBDT: 32.6,
  },
};

export const DEFAULT_AGENCY_SETTINGS: AgencySettings = {
  name: 'Orbit360Hub',
  tagline: 'BUILD / GROW / SCALE',
  email: 'orbit360hub@gmail.com',
  phone: '+880 1327-376359',
  website: 'https://orbit360hub.com',
  address: 'Plot 18, Block B, Banani C/A, Dhaka-1213, Bangladesh',
  taxNumber: 'BIN: 004819230-0101',
  currency: 'BDT',
  bankDetails: {
    bankName: 'City Bank PLC',
    accountName: 'Orbit360Hub Limited',
    accountNumber: '1102948271001',
    branchName: 'Gulshan-2 Branch, Dhaka',
    routingNumber: '225261890',
    swiftCode: 'CIBLBDDH',
  },
  mobileBanking: {
    bKashNumber: '01327376359',
    bKashType: 'Merchant',
    nagadNumber: '01327376359',
    rocketNumber: '',
  },
  defaultPaymentTerms: 'Net 15 Days. 50% advance before project commencement, remainder upon milestone review.',
  defaultNotes: 'Thank you for partnering with Orbit360Hub. All creative and intellectual property rights transfer upon final settlement.',
  invoicePrefix: 'INV',
  quotationPrefix: 'QUO',
};

export const PRESET_SERVICES: PresetService[] = [
  {
    title: 'Brand Identity & Visual System',
    category: 'Branding',
    defaultRate: 75000,
    description: 'Complete logo suite, color architecture, typography guidelines, brand book & vector assets.',
  },
  {
    title: 'Custom Web Application Development',
    category: 'Development',
    defaultRate: 150000,
    description: 'Full-stack responsive application with React, TypeScript, high-performance API integration & deployment.',
  },
  {
    title: 'High-Impact Video Editing & Motion Graphics',
    category: 'Video Production',
    defaultRate: 45000,
    description: 'Cinematic color grading, 4K reel cuts, sound design, animated lower thirds, and social media exports.',
  },
  {
    title: 'UI/UX Product Design & Prototyping',
    category: 'Design',
    defaultRate: 85000,
    description: 'Figma wireframes, high-fidelity design system, interactive micro-prototypes & developer handoff.',
  },
  {
    title: 'Monthly Growth & Performance Retainer',
    category: 'Marketing',
    defaultRate: 60000,
    description: 'Full-funnel digital ad management, conversion rate optimization, weekly sprint analytics reporting.',
  },
  {
    title: 'SEO Architecture & Content Optimization',
    category: 'Strategy',
    defaultRate: 35000,
    description: 'Technical site audit, schema markup injection, core web vitals optimization & keyword strategy.',
  },
];

export function calculateDocumentTotals(
  items: LineItem[],
  discountPercent: number = 0,
  taxPercent: number = 0,
  shippingOrFee: number = 0,
  amountPaid: number = 0
): DocumentTotals {
  const safeItems = Array.isArray(items) ? items : [];
  const subtotal = safeItems.reduce((acc, item) => {
    const qty = Math.max(0, Number(item.quantity) || 0);
    const rate = Math.max(0, Number(item.rate) || 0);
    return acc + qty * rate;
  }, 0);

  const cleanDiscountPct = Math.min(100, Math.max(0, Number(discountPercent) || 0));
  const discountAmount = Math.round((subtotal * (cleanDiscountPct / 100)) * 100) / 100;

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const cleanTaxPct = Math.min(100, Math.max(0, Number(taxPercent) || 0));
  const taxAmount = Math.round((taxableAmount * (cleanTaxPct / 100)) * 100) / 100;

  const cleanFee = Math.max(0, Number(shippingOrFee) || 0);
  const grandTotal = Math.round((taxableAmount + taxAmount + cleanFee) * 100) / 100;

  const cleanPaid = Math.max(0, Number(amountPaid) || 0);
  const balanceDue = Math.max(0, Math.round((grandTotal - cleanPaid) * 100) / 100);

  return {
    subtotal,
    discountPercent: cleanDiscountPct,
    discountAmount,
    taxableAmount,
    taxPercent: cleanTaxPct,
    taxAmount,
    shippingOrFee: cleanFee,
    grandTotal,
    amountPaid: cleanPaid,
    balanceDue,
  };
}

export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = 'BDT',
  includeSymbol: boolean = true
): string {
  const num = Number(amount) || 0;
  const config = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.BDT;

  // Format with 2 decimals
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  if (!includeSymbol) {
    return formattedNumber;
  }

  if (currencyCode === 'BDT') {
    return `৳${formattedNumber}`;
  }

  return `${config.symbol}${formattedNumber}`;
}

export function generateNextDocumentNumber(
  type: DocumentType,
  existingDocs: BillingDocument[] = [],
  customPrefix?: string
): string {
  const year = new Date().getFullYear();
  const prefix = customPrefix || (type === 'Invoice' ? 'INV' : 'QUO');
  const targetPattern = new RegExp(`^${prefix}-${year}-(\\d+)$`, 'i');

  let maxSequence = 0;
  for (const doc of existingDocs) {
    if (doc.type === type && doc.number) {
      const match = doc.number.trim().match(targetPattern);
      if (match && match[1]) {
        const seq = parseInt(match[1], 10);
        if (!isNaN(seq) && seq > maxSequence) {
          maxSequence = seq;
        }
      }
    }
  }

  const nextSeq = String(maxSequence + 1).padStart(4, '0');
  return `${prefix}-${year}-${nextSeq}`;
}

export function derivePaymentStatus(
  docType: DocumentType,
  grandTotal: number,
  amountPaid: number,
  dueDate: string
): PaymentStatus {
  if (docType === 'Quotation') {
    return 'Draft';
  }

  if (amountPaid >= grandTotal && grandTotal > 0) {
    return 'Paid';
  }

  if (amountPaid > 0 && amountPaid < grandTotal) {
    return 'Partially Paid';
  }

  if (dueDate) {
    const today = new Date().toISOString().slice(0, 10);
    if (today > dueDate && amountPaid < grandTotal) {
      return 'Overdue';
    }
  }

  return 'Unpaid';
}

export function convertQuoteToInvoice(
  quote: BillingDocument,
  existingDocs: BillingDocument[] = [],
  invoicePrefix: string = 'INV'
): BillingDocument {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + 14);

  const nextNumber = generateNextDocumentNumber('Invoice', existingDocs, invoicePrefix);
  const totals = calculateDocumentTotals(
    quote.items,
    quote.discountPercent,
    quote.taxPercent,
    quote.shippingOrFee,
    0
  );

  return {
    ...quote,
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: 'Invoice',
    number: nextNumber,
    issueDate: todayStr,
    dueDate: nextDueDate.toISOString().slice(0, 10),
    paymentStatus: 'Unpaid',
    amountPaid: 0,
    totals,
    convertedFromQuoteId: quote.id,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export function numberToWordsBDT(amount: number): string {
  const num = Math.floor(Math.abs(Number(amount) || 0));
  if (num === 0) return 'Zero Taka Only';

  const units = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertTwoDigits(n: number): string {
    if (n < 20) return units[n];
    const unitPart = n % 10;
    return tens[Math.floor(n / 10)] + (unitPart ? ' ' + units[unitPart] : '');
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let str = '';
    if (hundred) str += units[hundred] + ' Hundred';
    if (rest) str += (str ? ' ' : '') + convertTwoDigits(rest);
    return str;
  }

  // South Asian Numbering System: Crores (10,000,000), Lakhs (100,000), Thousands (1,000), Hundreds
  let remaining = num;
  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;

  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;

  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;

  const parts: string[] = [];

  if (crore) parts.push(convertThreeDigits(crore) + ' Crore');
  if (lakh) parts.push(convertTwoDigits(lakh) + ' Lakh');
  if (thousand) parts.push(convertTwoDigits(thousand) + ' Thousand');
  if (remaining) parts.push(convertThreeDigits(remaining));

  return `${parts.join(' ')} Bangladeshi Taka Only`;
}

export function getSampleDocuments(): BillingDocument[] {
  const agency = DEFAULT_AGENCY_SETTINGS;
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const d1: BillingDocument = {
    id: 'doc-sample-01',
    type: 'Invoice',
    number: `INV-${now.getFullYear()}-0001`,
    issueDate: today,
    dueDate: new Date(now.getTime() + 14 * 86400000).toISOString().slice(0, 10),
    currency: 'BDT',
    paymentStatus: 'Paid',
    client: {
      name: 'Tanvir Hossain',
      company: 'Apex Horizon Technologies Ltd.',
      email: 'tanvir@apexhorizon.com',
      phone: '+880 1711-892019',
      address: 'Level 8, Tower 71, Mohakhali DOHS, Dhaka-1206',
      taxId: 'TIN-4891028301',
    },
    items: [
      {
        id: 'item-1',
        description: 'Brand Identity Suite & Design System Guidelines',
        quantity: 1,
        rate: 75000,
        serviceCategory: 'Branding',
      },
      {
        id: 'item-2',
        description: 'Next.js Web Application Frontend Architecture & Motion Design',
        quantity: 1,
        rate: 145000,
        serviceCategory: 'Development',
      },
      {
        id: 'item-3',
        description: 'Cloud Infrastructure Setup & CI/CD Pipeline Deployment',
        quantity: 1,
        rate: 30000,
        serviceCategory: 'DevOps',
      },
    ],
    discountPercent: 5,
    taxPercent: 7.5,
    shippingOrFee: 0,
    amountPaid: 255312.50,
    paymentTerms: 'Payment completed via City Bank Wire on milestone sign-off.',
    notes: 'Thank you for choosing Orbit360Hub. Full source code repository handed over to Apex Horizon dev team.',
    terms: 'All deliverables are covered under Orbit360Hub standard 60-day post-launch warranty.',
    agencySnapshot: agency,
    totals: calculateDocumentTotals(
      [
        { id: '1', description: '', quantity: 1, rate: 75000 },
        { id: '2', description: '', quantity: 1, rate: 145000 },
        { id: '3', description: '', quantity: 1, rate: 30000 },
      ],
      5,
      7.5,
      0,
      255312.50
    ),
    createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
    updatedAt: today,
  };

  const d2: BillingDocument = {
    id: 'doc-sample-02',
    type: 'Invoice',
    number: `INV-${now.getFullYear()}-0002`,
    issueDate: today,
    dueDate: new Date(now.getTime() + 7 * 86400000).toISOString().slice(0, 10),
    currency: 'BDT',
    paymentStatus: 'Partially Paid',
    client: {
      name: 'Nusrat Jahan',
      company: 'Lumiere Lifestyle Brand',
      email: 'nusrat@lumierelifestyle.com',
      phone: '+880 1819-332011',
      address: 'House 42, Road 11, Banani, Dhaka-1213',
    },
    items: [
      {
        id: 'item-201',
        description: 'Commercial Brand Video Campaign — 4K Color Graded Reels & Shorts (Batch of 8)',
        quantity: 8,
        rate: 12500,
        serviceCategory: 'Video Production',
      },
      {
        id: 'item-202',
        description: '3D Product Rendering & Motion Asset Pack for E-Commerce',
        quantity: 1,
        rate: 45000,
        serviceCategory: '3D Design',
      },
    ],
    discountPercent: 0,
    taxPercent: 5,
    shippingOrFee: 0,
    amountPaid: 75000,
    paymentTerms: '50% initial retainer received via bKash Merchant. Remaining 50% due upon final asset delivery.',
    notes: 'Video master files provided in ProRes 422 HQ and h.264 formats.',
    terms: 'Includes up to 2 rounds of creative revisions per video deliverable.',
    agencySnapshot: agency,
    totals: calculateDocumentTotals(
      [
        { id: '1', description: '', quantity: 8, rate: 12500 },
        { id: '2', description: '', quantity: 1, rate: 45000 },
      ],
      0,
      5,
      0,
      75000
    ),
    createdAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
    updatedAt: today,
  };

  const d3: BillingDocument = {
    id: 'doc-sample-03',
    type: 'Quotation',
    number: `QUO-${now.getFullYear()}-0001`,
    issueDate: today,
    dueDate: new Date(now.getTime() + 30 * 86400000).toISOString().slice(0, 10),
    currency: 'BDT',
    paymentStatus: 'Draft',
    client: {
      name: 'Kazi Farhan',
      company: 'Zenith Global Logistics',
      email: 'farhan@zenithlogistics.bd',
      phone: '+880 1971-550992',
      address: 'Agrabad Commercial Area, Chittagong, Bangladesh',
    },
    items: [
      {
        id: 'item-301',
        description: 'Enterprise Tracking Portal UI/UX Redesign & Interactive Prototyping',
        quantity: 1,
        rate: 120000,
        serviceCategory: 'Design',
      },
      {
        id: 'item-302',
        description: 'Quarterly SEO & Organic Inbound Acquisition Strategy',
        quantity: 3,
        rate: 35000,
        serviceCategory: 'Marketing',
      },
    ],
    discountPercent: 10,
    taxPercent: 0,
    shippingOrFee: 0,
    amountPaid: 0,
    paymentTerms: 'Valid for 30 calendar days. 40% upfront upon proposal acceptance.',
    notes: 'Projected delivery timeline: 6 weeks from onboarding sign-off.',
    terms: 'Proposal rates valid until expiration date. Convert directly to invoice upon signed approval.',
    agencySnapshot: agency,
    totals: calculateDocumentTotals(
      [
        { id: '1', description: '', quantity: 1, rate: 120000 },
        { id: '2', description: '', quantity: 3, rate: 35000 },
      ],
      10,
      0,
      0,
      0
    ),
    createdAt: today,
    updatedAt: today,
  };

  return [d1, d2, d3];
}
