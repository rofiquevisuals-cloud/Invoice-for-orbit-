import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDocumentTotals,
  generateNextDocumentNumber,
  formatCurrency,
  derivePaymentStatus,
  numberToWordsBDT,
  convertQuoteToInvoice,
} from './billing.ts';
import type { BillingDocument, LineItem } from '../types/billing.ts';

test('calculateDocumentTotals computes subtotal, discounts, taxes, and balance accurately', () => {
  const items: LineItem[] = [
    { id: '1', description: 'Web Dev', quantity: 2, rate: 50000 },
    { id: '2', description: 'Logo Design', quantity: 1, rate: 25000 },
  ];

  // Subtotal = 100,000 + 25,000 = 125,000
  // Discount 10% = 12,500 => Taxable = 112,500
  // Tax 5% = 5,625 => Grand Total = 118,125
  // Amount Paid = 50,000 => Balance Due = 68,125
  const totals = calculateDocumentTotals(items, 10, 5, 0, 50000);

  assert.equal(totals.subtotal, 125000);
  assert.equal(totals.discountPercent, 10);
  assert.equal(totals.discountAmount, 12500);
  assert.equal(totals.taxableAmount, 112500);
  assert.equal(totals.taxPercent, 5);
  assert.equal(totals.taxAmount, 5625);
  assert.equal(totals.grandTotal, 118125);
  assert.equal(totals.amountPaid, 50000);
  assert.equal(totals.balanceDue, 68125);
});

test('calculateDocumentTotals handles zero and edge cases without negative values', () => {
  const emptyTotals = calculateDocumentTotals([], 0, 0, 0, 0);
  assert.equal(emptyTotals.subtotal, 0);
  assert.equal(emptyTotals.grandTotal, 0);
  assert.equal(emptyTotals.balanceDue, 0);

  // Overpayment case: amount paid > grand total => balance due should be 0, not negative
  const overpaid = calculateDocumentTotals(
    [{ id: '1', description: 'Consulting', quantity: 1, rate: 1000 }],
    0,
    0,
    0,
    1500
  );
  assert.equal(overpaid.balanceDue, 0);
});

test('generateNextDocumentNumber automatically calculates next sequential number', () => {
  const year = new Date().getFullYear();
  const mockDocs: BillingDocument[] = [
    {
      id: 'd1',
      type: 'Invoice',
      number: `INV-${year}-0001`,
    } as BillingDocument,
    {
      id: 'd2',
      type: 'Invoice',
      number: `INV-${year}-0004`,
    } as BillingDocument,
    {
      id: 'd3',
      type: 'Quotation',
      number: `QUO-${year}-0002`,
    } as BillingDocument,
  ];

  const nextInv = generateNextDocumentNumber('Invoice', mockDocs);
  assert.equal(nextInv, `INV-${year}-0005`);

  const nextQuo = generateNextDocumentNumber('Quotation', mockDocs);
  assert.equal(nextQuo, `QUO-${year}-0003`);

  // Empty list starts at 0001
  const firstInv = generateNextDocumentNumber('Invoice', []);
  assert.equal(firstInv, `INV-${year}-0001`);
});

test('formatCurrency formats BDT and foreign currencies with standard symbols', () => {
  assert.equal(formatCurrency(75000, 'BDT'), '৳75,000.00');
  assert.equal(formatCurrency(1200.5, 'USD'), '$1,200.50');
  assert.equal(formatCurrency(99.9, 'EUR'), '€99.90');
});

test('derivePaymentStatus returns correct semantic status', () => {
  assert.equal(derivePaymentStatus('Quotation', 1000, 0, '2026-12-31'), 'Draft');
  assert.equal(derivePaymentStatus('Invoice', 1000, 1000, '2026-12-31'), 'Paid');
  assert.equal(derivePaymentStatus('Invoice', 1000, 500, '2026-12-31'), 'Partially Paid');
  assert.equal(derivePaymentStatus('Invoice', 1000, 0, '2099-12-31'), 'Unpaid');
  assert.equal(derivePaymentStatus('Invoice', 1000, 0, '2020-01-01'), 'Overdue');
});

test('numberToWordsBDT formats amounts into South Asian denomination words', () => {
  assert.equal(numberToWordsBDT(50000), 'Fifty Thousand Bangladeshi Taka Only');
  assert.equal(numberToWordsBDT(125000), 'One Lakh Twenty Five Thousand Bangladeshi Taka Only');
  assert.equal(numberToWordsBDT(0), 'Zero Taka Only');
});

test('convertQuoteToInvoice creates a fresh invoice referencing original quote', () => {
  const quote: BillingDocument = {
    id: 'quote-100',
    type: 'Quotation',
    number: 'QUO-2026-0001',
    issueDate: '2026-10-01',
    dueDate: '2026-10-31',
    currency: 'BDT',
    paymentStatus: 'Draft',
    client: { name: 'Acme Corp', email: 'acme@example.com' },
    items: [{ id: '1', description: 'Brand Strategy', quantity: 1, rate: 50000 }],
    discountPercent: 0,
    taxPercent: 0,
    shippingOrFee: 0,
    amountPaid: 0,
    paymentTerms: 'Due in 14 days',
    notes: 'Quote note',
    terms: 'Quote terms',
    agencySnapshot: {} as any,
    totals: calculateDocumentTotals([{ id: '1', description: 'Brand Strategy', quantity: 1, rate: 50000 }]),
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
  };

  const invoice = convertQuoteToInvoice(quote, [quote]);
  assert.equal(invoice.type, 'Invoice');
  assert.match(invoice.number, /^INV-\d{4}-\d{4}$/);
  assert.equal(invoice.paymentStatus, 'Unpaid');
  assert.equal(invoice.convertedFromQuoteId, 'quote-100');
  assert.equal(invoice.items.length, 1);
  assert.equal(invoice.totals.grandTotal, 50000);
});
