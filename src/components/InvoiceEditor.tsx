import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Sparkles,
  RefreshCw,
  ArrowRight,
  DollarSign,
  Percent,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Briefcase
} from 'lucide-react';
import type {
  AgencySettings,
  BillingDocument,
  ClientDetails,
  CurrencyCode,
  DocumentType,
  LineItem,
  PaymentStatus,
  PresetService,
} from '../types/billing';
import {
  PRESET_SERVICES,
  SUPPORTED_CURRENCIES,
  calculateDocumentTotals,
  formatCurrency,
  generateNextDocumentNumber,
} from '../utils/billing';

interface InvoiceEditorProps {
  document: BillingDocument;
  agencySettings: AgencySettings;
  existingDocs: BillingDocument[];
  onUpdate: (updatedDoc: BillingDocument) => void;
  onSave: () => void;
  onConvertToInvoice?: () => void;
  onReset: () => void;
  isSaved: boolean;
}

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({
  document: doc,
  agencySettings,
  existingDocs,
  onUpdate,
  onSave,
  onConvertToInvoice,
  onReset,
  isSaved,
}) => {
  const [showPresetCatalog, setShowPresetCatalog] = useState(false);

  // Helper to update specific fields and automatically recalculate totals
  const updateField = <K extends keyof BillingDocument>(
    field: K,
    value: BillingDocument[K]
  ) => {
    const updated = { ...doc, [field]: value };
    const totals = calculateDocumentTotals(
      updated.items,
      updated.discountPercent,
      updated.taxPercent,
      updated.shippingOrFee,
      updated.amountPaid
    );
    onUpdate({ ...updated, totals, updatedAt: new Date().toISOString() });
  };

  const updateClient = <K extends keyof ClientDetails>(
    field: K,
    value: ClientDetails[K]
  ) => {
    const updatedClient = { ...doc.client, [field]: value };
    onUpdate({
      ...doc,
      client: updatedClient,
      updatedAt: new Date().toISOString(),
    });
  };

  // Line item handlers
  const handleAddItem = (preset?: PresetService) => {
    const newItem: LineItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      description: preset ? preset.description || preset.title : '',
      quantity: 1,
      rate: preset ? preset.defaultRate : 0,
      serviceCategory: preset ? preset.category : 'General',
    };

    const newItems = [...doc.items, newItem];
    const totals = calculateDocumentTotals(
      newItems,
      doc.discountPercent,
      doc.taxPercent,
      doc.shippingOrFee,
      doc.amountPaid
    );

    onUpdate({
      ...doc,
      items: newItems,
      totals,
      updatedAt: new Date().toISOString(),
    });
    setShowPresetCatalog(false);
  };

  const handleUpdateItem = (
    index: number,
    key: keyof LineItem,
    val: string | number
  ) => {
    const newItems = [...doc.items];
    newItems[index] = {
      ...newItems[index],
      [key]: key === 'quantity' || key === 'rate' ? Math.max(0, Number(val) || 0) : val,
    };

    const totals = calculateDocumentTotals(
      newItems,
      doc.discountPercent,
      doc.taxPercent,
      doc.shippingOrFee,
      doc.amountPaid
    );

    onUpdate({
      ...doc,
      items: newItems,
      totals,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleRemoveItem = (index: number) => {
    if (doc.items.length <= 1) {
      // Keep at least one empty item
      const emptyItems = [
        {
          id: `item-${Date.now()}`,
          description: '',
          quantity: 1,
          rate: 0,
        },
      ];
      const totals = calculateDocumentTotals(
        emptyItems,
        doc.discountPercent,
        doc.taxPercent,
        doc.shippingOrFee,
        doc.amountPaid
      );
      onUpdate({ ...doc, items: emptyItems, totals });
      return;
    }

    const newItems = doc.items.filter((_, i) => i !== index);
    const totals = calculateDocumentTotals(
      newItems,
      doc.discountPercent,
      doc.taxPercent,
      doc.shippingOrFee,
      doc.amountPaid
    );
    onUpdate({ ...doc, items: newItems, totals });
  };

  const handleRegenerateNumber = () => {
    const prefix = doc.type === 'Invoice' ? agencySettings.invoicePrefix : agencySettings.quotationPrefix;
    const newNum = generateNextDocumentNumber(doc.type, existingDocs, prefix);
    updateField('number', newNum);
  };

  const handleTypeChange = (newType: DocumentType) => {
    const prefix = newType === 'Invoice' ? agencySettings.invoicePrefix : agencySettings.quotationPrefix;
    const newNum = generateNextDocumentNumber(newType, existingDocs, prefix);
    const newStatus: PaymentStatus = newType === 'Quotation' ? 'Draft' : 'Unpaid';

    const updated = {
      ...doc,
      type: newType,
      number: newNum,
      paymentStatus: newStatus,
    };
    onUpdate(updated);
  };

  // Recent client picker extraction from existing saved documents
  const recentClients = Array.from(
    new Map(
      existingDocs
        .filter((d) => d.client.name.trim().length > 0)
        .map((d) => [d.client.email || d.client.name, d.client])
    ).values()
  );

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-6">
      {/* Top Banner / Type Selector & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          {/* Document Type Switcher */}
          <div className="inline-flex p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('Invoice')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                doc.type === 'Invoice'
                  ? 'bg-lime-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Invoice
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('Quotation')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                doc.type === 'Quotation'
                  ? 'bg-lime-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Quotation
            </button>
          </div>

          {doc.type === 'Quotation' && onConvertToInvoice && (
            <button
              type="button"
              onClick={onConvertToInvoice}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-800 text-lime-400 hover:bg-neutral-750 border border-lime-400/30 rounded-lg transition-colors"
              title="Convert this quotation into an active invoice"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              Convert to Invoice
            </button>
          )}
        </div>

        {/* Save State Badge & Quick Save */}
        <div className="flex items-center gap-3">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${
              isSaved
                ? 'bg-lime-950/80 text-lime-300 border border-lime-800/40'
                : 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle className="w-3 h-3 text-lime-400" /> Saved
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 text-amber-400" /> Unsaved Changes
              </>
            )}
          </span>

          <button
            type="button"
            onClick={onSave}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-lime-400 text-neutral-950 hover:bg-lime-300 rounded-xl transition-all shadow-md active:scale-95"
          >
            Save Document
          </button>
        </div>
      </div>

      {/* Section 1: Document Meta & Payment Status */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
          Document Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Document Number
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={doc.number}
                onChange={(e) => updateField('number', e.target.value)}
                placeholder="INV-2026-0001"
                className="w-full bg-neutral-950 border border-neutral-800 text-white font-mono text-sm rounded-xl px-3 py-2 pr-9 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
              />
              <button
                type="button"
                onClick={handleRegenerateNumber}
                title="Auto-generate next sequential number"
                className="absolute right-2 text-neutral-400 hover:text-lime-400 transition-colors p-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Currency
            </label>
            <select
              value={doc.currency}
              onChange={(e) => updateField('currency', e.target.value as CurrencyCode)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
            >
              {Object.values(SUPPORTED_CURRENCIES).map((cur) => (
                <option key={cur.code} value={cur.code}>
                  {cur.symbol} — {cur.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Issue Date
            </label>
            <input
              type="date"
              value={doc.issueDate}
              onChange={(e) => updateField('issueDate', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              {doc.type === 'Quotation' ? 'Valid Until' : 'Due Date'}
            </label>
            <input
              type="date"
              value={doc.dueDate}
              onChange={(e) => updateField('dueDate', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
            />
          </div>
        </div>

        {/* Payment Status Bar (for Invoices) */}
        {doc.type === 'Invoice' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Payment Status Tracking
              </label>
              <select
                value={doc.paymentStatus}
                onChange={(e) => updateField('paymentStatus', e.target.value as PaymentStatus)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Payment Method / Reference
              </label>
              <input
                type="text"
                value={doc.paymentTerms}
                onChange={(e) => updateField('paymentTerms', e.target.value)}
                placeholder="e.g. City Bank Wire / bKash Merchant / Net 15"
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Client Details */}
      <div className="space-y-3 pt-3 border-t border-neutral-800">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold tracking-wider text-neutral-400 uppercase flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-lime-400" />
            Client Details
          </h3>

          {recentClients.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400">Quick autofill:</span>
              <select
                onChange={(e) => {
                  const found = recentClients.find(
                    (c) => (c.email || c.name) === e.target.value
                  );
                  if (found) {
                    onUpdate({ ...doc, client: { ...found } });
                  }
                }}
                defaultValue=""
                className="text-xs bg-neutral-950 border border-neutral-800 text-neutral-300 rounded-lg px-2 py-1 focus:outline-none focus:border-lime-400"
              >
                <option value="" disabled>
                  Select saved client...
                </option>
                {recentClients.map((c, i) => (
                  <option key={i} value={c.email || c.name}>
                    {c.company ? `${c.company} (${c.name})` : c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Client / Contact Name <span className="text-lime-400">*</span>
            </label>
            <input
              type="text"
              value={doc.client.name}
              onChange={(e) => updateClient('name', e.target.value)}
              placeholder="e.g. Tanvir Hossain"
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Company / Business Name
            </label>
            <input
              type="text"
              value={doc.client.company || ''}
              onChange={(e) => updateClient('company', e.target.value)}
              placeholder="e.g. Apex Horizon Technologies"
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Client Email
            </label>
            <input
              type="email"
              value={doc.client.email}
              onChange={(e) => updateClient('email', e.target.value)}
              placeholder="billing@company.com"
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Client Phone
            </label>
            <input
              type="text"
              value={doc.client.phone || ''}
              onChange={(e) => updateClient('phone', e.target.value)}
              placeholder="+880 1711-000000"
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Billing Address
            </label>
            <textarea
              rows={2}
              value={doc.client.address || ''}
              onChange={(e) => updateClient('address', e.target.value)}
              placeholder="Street, Tower, City, Country"
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Services & Line Items */}
      <div className="space-y-3 pt-3 border-t border-neutral-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold tracking-wider text-neutral-400 uppercase flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-lime-400" />
              Services & Line Items ({doc.items.length})
            </h3>
            <p className="text-[11px] text-neutral-500">
              Add individual project milestones, deliverables, hourly or retainer services.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPresetCatalog(!showPresetCatalog)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-950 text-neutral-200 hover:text-lime-400 border border-neutral-800 hover:border-lime-400/40 rounded-xl transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-lime-400" />
              Agency Catalog
            </button>

            <button
              type="button"
              onClick={() => handleAddItem()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-neutral-800 hover:bg-neutral-750 text-white border border-neutral-700 rounded-xl transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-lime-400" />
              Add Blank Row
            </button>
          </div>
        </div>

        {/* Preset Catalog Accordion */}
        {showPresetCatalog && (
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-lime-400 uppercase tracking-wide">
                Orbit360Hub Service Templates (Click to insert)
              </span>
              <button
                type="button"
                onClick={() => setShowPresetCatalog(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
              {PRESET_SERVICES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddItem(preset)}
                  className="text-left p-2.5 rounded-lg border border-neutral-800/80 hover:border-lime-400/50 hover:bg-neutral-900 transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-neutral-200 group-hover:text-lime-300">
                      {preset.title}
                    </span>
                    <span className="text-xs font-mono font-semibold text-lime-400 tabular-nums">
                      {formatCurrency(preset.defaultRate, doc.currency)}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Line Items Table */}
        <div className="space-y-2.5">
          {doc.items.map((item, index) => {
            const lineTotal = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
            return (
              <div
                key={item.id}
                className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2.5 transition-all hover:border-neutral-700"
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs font-mono font-bold text-neutral-500 pt-2 shrink-0">
                    {String(index + 1).padStart(2, '0')}.
                  </span>
                  <div className="flex-1">
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) =>
                        handleUpdateItem(index, 'description', e.target.value)
                      }
                      placeholder="Service / deliverable description (e.g. High-impact video campaign with color grading)"
                      className="w-full bg-transparent border-0 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:ring-0 p-1 resize-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    title="Remove item"
                    className="text-neutral-500 hover:text-red-400 p-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Numbers row: Quantity, Unit Rate, Line Total */}
                <div className="grid grid-cols-3 sm:grid-cols-12 gap-3 pt-2 border-t border-neutral-900 items-center">
                  <div className="col-span-1 sm:col-span-3">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-0.5">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateItem(index, 'quantity', e.target.value)
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 text-white font-mono text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-lime-400"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-4">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-0.5">
                      Rate ({SUPPORTED_CURRENCIES[doc.currency]?.symbol})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.rate}
                      onChange={(e) =>
                        handleUpdateItem(index, 'rate', e.target.value)
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 text-white font-mono text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-lime-400"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-5 text-right sm:pr-2">
                    <span className="block text-[10px] font-bold text-neutral-400 uppercase mb-0.5">
                      Line Total
                    </span>
                    <span className="text-sm font-mono font-bold text-lime-400 tabular-nums">
                      {formatCurrency(lineTotal, doc.currency)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4: Discounts, Tax, Amount Paid & Financial Summary */}
      <div className="space-y-4 pt-3 border-t border-neutral-800">
        <h3 className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
          Taxes, Discounts & Settlement
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Inputs for adjustments */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center justify-between">
                  <span>Discount</span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {doc.discountPercent}%
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={doc.discountPercent}
                    onChange={(e) =>
                      updateField('discountPercent', Math.max(0, Number(e.target.value) || 0))
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white font-mono text-sm rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-lime-400"
                  />
                  <Percent className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center justify-between">
                  <span>Tax / VAT</span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {doc.taxPercent}%
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={doc.taxPercent}
                    onChange={(e) =>
                      updateField('taxPercent', Math.max(0, Number(e.target.value) || 0))
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white font-mono text-sm rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-lime-400"
                  />
                  <Percent className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-3" />
                </div>
              </div>
            </div>

            {/* Amount Paid (for invoices) */}
            {doc.type === 'Invoice' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center justify-between">
                  <span>Amount Paid to Date</span>
                  <button
                    type="button"
                    onClick={() => updateField('amountPaid', doc.totals.grandTotal)}
                    className="text-[10px] font-bold text-lime-400 hover:underline"
                  >
                    Mark Paid in Full
                  </button>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={doc.amountPaid}
                    onChange={(e) =>
                      updateField('amountPaid', Math.max(0, Number(e.target.value) || 0))
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white font-mono text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Project Scope / Terms & Notes
              </label>
              <textarea
                rows={3}
                value={doc.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Include milestones, delivery schedule, revisions policy, or wire instructions."
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400 resize-none"
              />
            </div>
          </div>

          {/* Computed Totals Breakdown Card */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2.5">
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider pb-2 border-b border-neutral-800">
              Calculation Summary
            </div>

            <div className="flex items-center justify-between text-sm text-neutral-300">
              <span>Subtotal</span>
              <span className="font-mono font-semibold tabular-nums">
                {formatCurrency(doc.totals.subtotal, doc.currency)}
              </span>
            </div>

            {doc.totals.discountAmount > 0 && (
              <div className="flex items-center justify-between text-sm text-emerald-400">
                <span>Discount ({doc.totals.discountPercent}%)</span>
                <span className="font-mono font-semibold tabular-nums">
                  − {formatCurrency(doc.totals.discountAmount, doc.currency)}
                </span>
              </div>
            )}

            {doc.totals.taxAmount > 0 && (
              <div className="flex items-center justify-between text-sm text-neutral-300">
                <span>Tax / VAT ({doc.totals.taxPercent}%)</span>
                <span className="font-mono font-semibold tabular-nums">
                  + {formatCurrency(doc.totals.taxAmount, doc.currency)}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Grand Total
              </span>
              <span className="text-lg font-bold font-mono text-lime-400 tabular-nums">
                {formatCurrency(doc.totals.grandTotal, doc.currency)}
              </span>
            </div>

            {doc.type === 'Invoice' && (
              <>
                <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                  <span>Amount Paid</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(doc.totals.amountPaid, doc.currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm font-bold pt-1 border-t border-neutral-850">
                  <span className="text-neutral-200">Balance Due</span>
                  <span
                    className={`font-mono tabular-nums ${
                      doc.totals.balanceDue > 0 ? 'text-amber-400' : 'text-lime-400'
                    }`}
                  >
                    {formatCurrency(doc.totals.balanceDue, doc.currency)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-800">
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-neutral-400 hover:text-white px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          Clear / New Blank Document
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-lime-400 text-neutral-950 hover:bg-lime-300 rounded-xl transition-all shadow-lg active:scale-95"
          >
            Save Document to Database
          </button>
        </div>
      </div>
    </div>
  );
};
