import React from 'react';
import {
  Printer,
  Download,
  Share2,
  Copy,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import type { AgencySettings, BillingDocument } from '../types/billing';
import {
  formatCurrency,
  numberToWordsBDT,
  SUPPORTED_CURRENCIES,
} from '../utils/billing';
import { OrbitLogo } from './OrbitLogo';

interface InvoicePreviewProps {
  document: BillingDocument;
  agencySettings: AgencySettings;
  onConvertToInvoice?: () => void;
  onPrint?: () => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  document: doc,
  agencySettings,
  onConvertToInvoice,
  onPrint,
}) => {
  const isQuote = doc.type === 'Quotation';
  const currencyConfig = SUPPORTED_CURRENCIES[doc.currency] || SUPPORTED_CURRENCIES.BDT;

  // Format dates cleanly (e.g., "19 Oct 2026")
  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString + (isoString.length === 10 ? 'T00:00:00' : ''));
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const handleTriggerPrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Partially Paid':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Overdue':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'Cancelled':
        return 'text-slate-600 bg-slate-100 border-slate-300';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="printable-document-root space-y-4">
      {/* Top action toolbar (hidden when printing) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 p-3.5 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Live Document Preview
          </span>
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              isQuote
                ? 'text-cyan-400 bg-cyan-950/60 border-cyan-800/40'
                : doc.paymentStatus === 'Paid'
                ? 'text-lime-400 bg-lime-950/60 border-lime-800/40'
                : 'text-amber-400 bg-amber-950/60 border-amber-800/40'
            }`}
          >
            {isQuote ? 'Quotation Draft' : doc.paymentStatus.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isQuote && onConvertToInvoice && (
            <button
              type="button"
              onClick={onConvertToInvoice}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-neutral-800 text-lime-400 hover:bg-neutral-750 border border-lime-400/30 rounded-xl transition-all"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              Convert to Invoice
            </button>
          )}

          <button
            type="button"
            onClick={handleTriggerPrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-lime-400 text-neutral-950 hover:bg-lime-300 rounded-xl transition-all shadow-md active:scale-95"
            title="Open browser print dialog to save as pristine vector PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* The Printable Paper Sheet */}
      <div
        id="invoice-paper-sheet"
        className="printable-document-sheet bg-white text-slate-900 shadow-2xl rounded-xl p-8 sm:p-12 border border-slate-200 transition-all font-sans relative overflow-hidden"
        style={{ minHeight: '1050px' }}
      >
        {/* Subtle decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-lime-400 via-emerald-500 to-slate-900" />

        {/* 1. Header: Orbit360Hub Branding & Document Meta */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-8 border-b-2 border-slate-900">
          <div>
            <OrbitLogo variant="horizontal" theme="print" size="md" />
            <div className="mt-3 text-xs text-slate-600 leading-relaxed max-w-sm">
              <p className="font-semibold text-slate-800">{agencySettings.name}</p>
              <p>{agencySettings.address}</p>
              <p className="mt-1">
                <span className="font-medium text-slate-700">Email:</span> {agencySettings.email} ·{' '}
                <span className="font-medium text-slate-700">Phone:</span> {agencySettings.phone}
              </p>
              {agencySettings.taxNumber && (
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                  {agencySettings.taxNumber}
                </p>
              )}
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
              {isQuote ? 'Quotation' : 'Invoice'}
            </h1>
            <p className="text-sm font-mono font-bold text-slate-800 mt-1">
              {doc.number || 'DRAFT'}
            </p>

            <div className="mt-3 text-xs text-slate-600 space-y-1">
              <div>
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  Date of Issue:{' '}
                </span>
                <span className="font-semibold text-slate-800">
                  {formatDate(doc.issueDate)}
                </span>
              </div>

              <div>
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  {isQuote ? 'Valid Until: ' : 'Payment Due: '}
                </span>
                <span className="font-semibold text-slate-800">
                  {formatDate(doc.dueDate)}
                </span>
              </div>

              {!isQuote && (
                <div className="pt-1">
                  <span
                    className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getStatusColor(
                      doc.paymentStatus
                    )}`}
                  >
                    Status: {doc.paymentStatus}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Client & Billing Party Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block mb-1.5">
              Billed To
            </span>
            <div className="text-slate-800">
              <h2 className="text-base font-bold text-slate-950">
                {doc.client.name || 'Valued Client'}
              </h2>
              {doc.client.company && (
                <p className="text-xs font-semibold text-slate-700">
                  {doc.client.company}
                </p>
              )}
              {doc.client.email && (
                <p className="text-xs text-slate-600 mt-1">
                  {doc.client.email}
                </p>
              )}
              {doc.client.phone && (
                <p className="text-xs text-slate-600">
                  {doc.client.phone}
                </p>
              )}
              {doc.client.address && (
                <p className="text-xs text-slate-600 whitespace-pre-line mt-1">
                  {doc.client.address}
                </p>
              )}
              {doc.client.taxId && (
                <p className="text-[11px] font-mono text-slate-500 mt-1">
                  Tax ID / TIN: {doc.client.taxId}
                </p>
              )}
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block mb-1.5">
              Service Provider
            </span>
            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900 text-sm">{agencySettings.name}</p>
              <p>{agencySettings.tagline}</p>
              <p>{agencySettings.website}</p>
              <p className="text-slate-500">
                Default Currency: {currencyConfig.name}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Services & Line Items Table */}
        <div className="py-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-2 w-12 text-center">#</th>
                <th className="py-3 px-2">Description / Deliverable</th>
                <th className="py-3 px-2 text-center w-20">Qty</th>
                <th className="py-3 px-2 text-right w-32">Rate ({currencyConfig.symbol})</th>
                <th className="py-3 px-2 text-right w-36">Amount ({currencyConfig.symbol})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {doc.items.map((item, index) => {
                const lineTotal = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-2 text-center font-mono text-slate-500">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3.5 px-2 font-medium text-slate-900 whitespace-pre-line leading-relaxed">
                      {item.description || 'Professional Agency Service'}
                    </td>
                    <td className="py-3.5 px-2 text-center font-mono text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-2 text-right font-mono text-slate-700 tabular-nums">
                      {formatCurrency(item.rate, doc.currency, false)}
                    </td>
                    <td className="py-3.5 px-2 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatCurrency(lineTotal, doc.currency, false)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 4. Financial Calculations Breakdown */}
        <div className="pt-4 border-t-2 border-slate-800 flex flex-col sm:flex-row justify-between items-start gap-8">
          {/* Amount In Words & Terms Note */}
          <div className="flex-1 space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Amount in Words
              </span>
              <p className="font-semibold text-slate-900 italic">
                {doc.currency === 'BDT'
                  ? numberToWordsBDT(doc.totals.grandTotal)
                  : `${doc.totals.grandTotal.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })} ${currencyConfig.name}`}
              </p>
            </div>

            {/* Scope / Notes */}
            {doc.notes && (
              <div className="text-xs text-slate-600">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  {isQuote ? 'Scope & Proposal Notes' : 'Notes & Instructions'}
                </span>
                <p className="whitespace-pre-line leading-relaxed">{doc.notes}</p>
              </div>
            )}
          </div>

          {/* Totals Column */}
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {formatCurrency(doc.totals.subtotal, doc.currency)}
              </span>
            </div>

            {doc.totals.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount ({doc.totals.discountPercent}%):</span>
                <span className="font-mono font-semibold tabular-nums">
                  − {formatCurrency(doc.totals.discountAmount, doc.currency)}
                </span>
              </div>
            )}

            {doc.totals.taxAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Tax / VAT ({doc.totals.taxPercent}%):</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  + {formatCurrency(doc.totals.taxAmount, doc.currency)}
                </span>
              </div>
            )}

            {doc.totals.shippingOrFee > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Additional Fee:</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  + {formatCurrency(doc.totals.shippingOrFee, doc.currency)}
                </span>
              </div>
            )}

            <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-baseline">
              <span className="text-sm font-black text-slate-900 uppercase tracking-tight">
                Total Amount:
              </span>
              <span className="text-lg font-black font-mono text-slate-950 tabular-nums">
                {formatCurrency(doc.totals.grandTotal, doc.currency)}
              </span>
            </div>

            {!isQuote && (
              <>
                <div className="flex justify-between text-slate-600 pt-1">
                  <span>Paid to Date:</span>
                  <span className="font-mono font-semibold tabular-nums text-slate-800">
                    {formatCurrency(doc.totals.amountPaid, doc.currency)}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-900">Balance Due:</span>
                  <span
                    className={`text-base font-bold font-mono tabular-nums ${
                      doc.totals.balanceDue > 0 ? 'text-amber-700' : 'text-emerald-700'
                    }`}
                  >
                    {formatCurrency(doc.totals.balanceDue, doc.currency)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 5. Payment Methods & Remittance Information */}
        <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-lime-600" />
              Bank Settlement Details (City Bank PLC / Wire)
            </span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
              <span className="text-slate-500">Bank Name:</span>
              <span className="font-semibold text-slate-900">
                {agencySettings.bankDetails.bankName}
              </span>

              <span className="text-slate-500">Account Name:</span>
              <span className="font-semibold text-slate-900">
                {agencySettings.bankDetails.accountName}
              </span>

              <span className="text-slate-500">Account Number:</span>
              <span className="font-mono font-bold text-slate-950">
                {agencySettings.bankDetails.accountNumber}
              </span>

              <span className="text-slate-500">Branch & Routing:</span>
              <span className="text-slate-800">
                {agencySettings.bankDetails.branchName} ·{' '}
                {agencySettings.bankDetails.routingNumber}
              </span>

              {agencySettings.bankDetails.swiftCode && (
                <>
                  <span className="text-slate-500">SWIFT Code:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {agencySettings.bankDetails.swiftCode}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-2">
              Mobile Financial Services (bKash & Nagad)
            </span>
            <div className="space-y-1.5 text-[11px]">
              {agencySettings.mobileBanking.bKashNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">
                    bKash {agencySettings.mobileBanking.bKashType || 'Merchant'}:
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {agencySettings.mobileBanking.bKashNumber}
                  </span>
                </div>
              )}

              {agencySettings.mobileBanking.nagadNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Nagad:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {agencySettings.mobileBanking.nagadNumber}
                  </span>
                </div>
              )}

              {doc.paymentTerms && (
                <div className="pt-2 border-t border-slate-200 text-slate-600 text-[10px]">
                  <span className="font-semibold text-slate-800">Terms: </span>
                  {doc.paymentTerms}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 6. Document Footer & Signatory */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-end justify-between gap-6 text-[11px] text-slate-500">
          <div>
            <p className="font-semibold text-slate-800">{agencySettings.name}</p>
            <p className="text-[10px] text-slate-500">{agencySettings.tagline} · {agencySettings.website}</p>
            <p className="text-[10px] text-slate-400 mt-1">
              Computer-generated document. Valid without physical signature.
            </p>
          </div>

          <div className="text-center sm:text-right w-48">
            <div className="border-b border-slate-400 pb-1 mb-1 font-signature text-sm font-semibold text-slate-800">
              Orbit360Hub Accounts
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Authorized Signatory
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
