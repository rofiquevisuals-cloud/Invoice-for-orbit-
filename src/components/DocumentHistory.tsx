import React, { useState } from 'react';
import {
  Search,
  Filter,
  FileText,
  FileCheck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Trash2,
  Copy,
  Edit,
  Printer,
  Download,
  Upload,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Briefcase,
  X
} from 'lucide-react';
import type {
  AgencySettings,
  BillingDocument,
  DocumentType,
  PaymentStatus,
} from '../types/billing';
import {
  formatCurrency,
  convertQuoteToInvoice,
} from '../utils/billing';
import { InvoicePreview } from './InvoicePreview';

interface DocumentHistoryProps {
  documents: BillingDocument[];
  agencySettings: AgencySettings;
  onOpenDocument: (doc: BillingDocument) => void;
  onDeleteDocument: (docId: string) => void;
  onDuplicateDocument: (doc: BillingDocument) => void;
  onConvertToInvoice: (quote: BillingDocument) => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onExportCSV: () => void;
  onLoadSamples: () => void;
}

export const DocumentHistory: React.FC<DocumentHistoryProps> = ({
  documents,
  agencySettings,
  onOpenDocument,
  onDeleteDocument,
  onDuplicateDocument,
  onConvertToInvoice,
  onExportJSON,
  onImportJSON,
  onExportCSV,
  onLoadSamples,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'All' | DocumentType>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | PaymentStatus>('All');
  const [previewModalDoc, setPreviewModalDoc] = useState<BillingDocument | null>(null);

  // Financial KPI calculations
  const invoices = documents.filter((d) => d.type === 'Invoice');
  const quotations = documents.filter((d) => d.type === 'Quotation');

  const totalInvoiced = invoices.reduce((sum, d) => sum + (d.totals?.grandTotal || 0), 0);
  const totalCollected = invoices.reduce((sum, d) => sum + (d.totals?.amountPaid || 0), 0);
  const totalOutstanding = invoices.reduce((sum, d) => sum + (d.totals?.balanceDue || 0), 0);
  const totalQuotePipeline = quotations.reduce((sum, d) => sum + (d.totals?.grandTotal || 0), 0);

  // Filtering documents
  const filteredDocs = documents.filter((doc) => {
    // Type filter
    if (selectedType !== 'All' && doc.type !== selectedType) return false;

    // Status filter
    if (selectedStatus !== 'All' && doc.paymentStatus !== selectedStatus) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = doc.number?.toLowerCase().includes(q);
      const matchClientName = doc.client?.name?.toLowerCase().includes(q);
      const matchCompany = doc.client?.company?.toLowerCase().includes(q);
      const matchEmail = doc.client?.email?.toLowerCase().includes(q);
      return matchNumber || matchClientName || matchCompany || matchEmail;
    }

    return true;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJSON(file);
      e.target.value = '';
    }
  };

  const getStatusBadge = (status: PaymentStatus, type: DocumentType) => {
    if (type === 'Quotation') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/70 text-cyan-300 border border-cyan-800/40">
          <Clock className="w-3 h-3" /> Quote
        </span>
      );
    }

    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800/40">
            <CheckCircle className="w-3 h-3" /> Paid
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-800/40">
            <Clock className="w-3 h-3" /> Partial
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/70 text-rose-300 border border-rose-800/40">
            <AlertTriangle className="w-3 h-3" /> Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
            Unpaid
          </span>
        );
    }
  };

  return (
    <div className="history-view space-y-6">
      {/* 1. Database Metrics & Analytics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase">
            <span>Total Invoiced</span>
            <DollarSign className="w-4 h-4 text-lime-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            {formatCurrency(totalInvoiced, 'BDT')}
          </div>
          <p className="text-[11px] text-neutral-400">
            Across {invoices.length} billing invoices
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase">
            <span>Collected Revenue</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            {formatCurrency(totalCollected, 'BDT')}
          </div>
          <p className="text-[11px] text-neutral-400">
            Received in bank / mobile rails
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase">
            <span>Outstanding Balance</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
            {formatCurrency(totalOutstanding, 'BDT')}
          </div>
          <p className="text-[11px] text-neutral-400">
            Pending client settlement
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase">
            <span>Quotation Pipeline</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400 tabular-nums">
            {formatCurrency(totalQuotePipeline, 'BDT')}
          </div>
          <p className="text-[11px] text-neutral-400">
            {quotations.length} prospective proposals
          </p>
        </div>
      </div>

      {/* 2. Controls Toolbar & Search */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice number, client name, company, email..."
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-lime-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters & Export Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400"
            >
              <option value="All">All Types</option>
              <option value="Invoice">Invoices Only</option>
              <option value="Quotation">Quotations Only</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="bg-neutral-950 border border-neutral-800 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Overdue">Overdue</option>
              <option value="Draft">Draft</option>
            </select>

            <div className="h-6 w-px bg-neutral-800 hidden sm:block" />

            <button
              type="button"
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 rounded-xl transition-colors"
              title="Download CSV spreadsheet ledger of all documents"
            >
              <Download className="w-3.5 h-3.5 text-lime-400" />
              CSV
            </button>

            <button
              type="button"
              onClick={onExportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 rounded-xl transition-colors"
              title="Export complete database backup JSON"
            >
              <Download className="w-3.5 h-3.5 text-lime-400" />
              Backup
            </button>

            <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 rounded-xl transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-lime-400" />
              Restore
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Database records table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-neutral-950/80 border-b border-neutral-800 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                <th className="py-3 px-4">Document #</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Client / Company</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 bg-neutral-900/50">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    <p className="text-sm font-medium">No documents found matching criteria.</p>
                    <button
                      type="button"
                      onClick={onLoadSamples}
                      className="mt-3 text-xs text-lime-400 hover:underline inline-flex items-center gap-1"
                    >
                      Load sample demo documents
                    </button>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-neutral-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                      {doc.number}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                          doc.type === 'Invoice'
                            ? 'bg-neutral-800 text-lime-300'
                            : 'bg-neutral-800 text-cyan-300'
                        }`}
                      >
                        {doc.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-neutral-200">
                        {doc.client.name || 'Unnamed Client'}
                      </div>
                      {doc.client.company && (
                        <div className="text-xs text-neutral-400">
                          {doc.client.company}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-neutral-400 whitespace-nowrap text-xs font-mono">
                      {doc.issueDate}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white tabular-nums whitespace-nowrap">
                      {formatCurrency(doc.totals?.grandTotal || 0, doc.currency)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums whitespace-nowrap text-xs">
                      {doc.type === 'Invoice' ? (
                        <span
                          className={
                            (doc.totals?.balanceDue || 0) > 0
                              ? 'text-amber-400 font-semibold'
                              : 'text-neutral-500'
                          }
                        >
                          {formatCurrency(doc.totals?.balanceDue || 0, doc.currency)}
                        </span>
                      ) : (
                        <span className="text-neutral-500">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {getStatusBadge(doc.paymentStatus, doc.type)}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewModalDoc(doc)}
                          title="Quick preview"
                          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenDocument(doc)}
                          title="Edit in Studio"
                          className="p-1.5 text-neutral-400 hover:text-lime-400 hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {doc.type === 'Quotation' && (
                          <button
                            type="button"
                            onClick={() => onConvertToInvoice(doc)}
                            title="Convert quotation to invoice"
                            className="p-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-neutral-800 rounded-lg transition-colors"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onDuplicateDocument(doc)}
                          title="Duplicate document"
                          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteDocument(doc.id)}
                          title="Delete document"
                          className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick View Modal */}
      {previewModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-800">
              <span className="text-sm font-bold text-white">
                Document Preview: {previewModalDoc.number}
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalDoc(null)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <InvoicePreview
              document={previewModalDoc}
              agencySettings={agencySettings}
              onConvertToInvoice={() => {
                onConvertToInvoice(previewModalDoc);
                setPreviewModalDoc(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
