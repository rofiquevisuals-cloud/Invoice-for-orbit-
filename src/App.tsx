/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type {
  AgencySettings,
  BillingDocument,
  DocumentType,
} from './types/billing';
import {
  DEFAULT_AGENCY_SETTINGS,
  calculateDocumentTotals,
  convertQuoteToInvoice,
  generateNextDocumentNumber,
  getSampleDocuments,
} from './utils/billing';
import { Navigation, type ActiveTab } from './components/Navigation';
import { InvoiceEditor } from './components/InvoiceEditor';
import { InvoicePreview } from './components/InvoicePreview';
import { DocumentHistory } from './components/DocumentHistory';
import { BusinessSettings } from './components/BusinessSettings';
import { OrbitLogo } from './components/OrbitLogo';

const STORAGE_DOCS_KEY = 'orbit360hub_documents_v2';
const STORAGE_SETTINGS_KEY = 'orbit360hub_agency_settings_v2';

export default function App() {
  const [agencySettings, setAgencySettings] = useState<AgencySettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SETTINGS_KEY);
      return stored ? { ...DEFAULT_AGENCY_SETTINGS, ...JSON.parse(stored) } : DEFAULT_AGENCY_SETTINGS;
    } catch {
      return DEFAULT_AGENCY_SETTINGS;
    }
  });

  const [documents, setDocuments] = useState<BillingDocument[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_DOCS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback to sample documents
    }
    return getSampleDocuments();
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('studio');

  // Active document loaded into Editor & Preview
  const [currentDoc, setCurrentDoc] = useState<BillingDocument>(() => {
    // If we have documents, default to the first one, or create a blank invoice
    const initialList = documents.length > 0 ? documents : getSampleDocuments();
    return initialList[0] || createBlankDocument('Invoice', initialList, DEFAULT_AGENCY_SETTINGS);
  });

  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize documents to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(documents));
    } catch (err) {
      console.error('Failed to save documents to localStorage:', err);
    }
  }, [documents]);

  // Synchronize agency settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(agencySettings));
    } catch (err) {
      console.error('Failed to save settings to localStorage:', err);
    }
  }, [agencySettings]);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  function createBlankDocument(
    type: DocumentType = 'Invoice',
    docsList: BillingDocument[] = documents,
    settings: AgencySettings = agencySettings
  ): BillingDocument {
    const today = new Date().toISOString().slice(0, 10);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const prefix = type === 'Invoice' ? settings.invoicePrefix : settings.quotationPrefix;
    const nextNumber = generateNextDocumentNumber(type, docsList, prefix);

    const initialItem = {
      id: `item-${Date.now()}`,
      description: 'Creative agency services / consultation',
      quantity: 1,
      rate: 50000,
    };

    return {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      number: nextNumber,
      issueDate: today,
      dueDate: dueDate.toISOString().slice(0, 10),
      currency: settings.currency || 'BDT',
      paymentStatus: type === 'Quotation' ? 'Draft' : 'Unpaid',
      client: {
        name: '',
        company: '',
        email: '',
        phone: '',
        address: '',
      },
      items: [initialItem],
      discountPercent: 0,
      taxPercent: 0,
      shippingOrFee: 0,
      amountPaid: 0,
      paymentTerms: settings.defaultPaymentTerms,
      notes: settings.defaultNotes,
      terms: 'All deliverables subject to standard agency client agreement.',
      agencySnapshot: settings,
      totals: calculateDocumentTotals([initialItem], 0, 0, 0, 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const handleNewDocument = (type: DocumentType = 'Invoice') => {
    const newDoc = createBlankDocument(type);
    setCurrentDoc(newDoc);
    setIsSaved(false);
    setActiveTab('studio');
    showToast(`Started new ${type} draft (${newDoc.number})`);
  };

  const handleUpdateCurrentDoc = (updated: BillingDocument) => {
    setCurrentDoc(updated);
    setIsSaved(false);
  };

  const handleSaveDocument = () => {
    if (!currentDoc.client.name.trim()) {
      showToast('⚠️ Please specify a client or company name before saving.');
      return;
    }

    const docToSave: BillingDocument = {
      ...currentDoc,
      agencySnapshot: agencySettings,
      updatedAt: new Date().toISOString(),
    };

    const existingIndex = documents.findIndex((d) => d.id === docToSave.id);
    let updatedDocs: BillingDocument[];

    if (existingIndex >= 0) {
      updatedDocs = [...documents];
      updatedDocs[existingIndex] = docToSave;
    } else {
      updatedDocs = [docToSave, ...documents];
    }

    setDocuments(updatedDocs);
    setCurrentDoc(docToSave);
    setIsSaved(true);
    showToast(`✓ Document ${docToSave.number} saved to local database.`);
  };

  const handleOpenDocument = (doc: BillingDocument) => {
    setCurrentDoc(doc);
    setIsSaved(true);
    setActiveTab('studio');
  };

  const handleDeleteDocument = (docId: string) => {
    const docToDelete = documents.find((d) => d.id === docId);
    if (!docToDelete) return;

    if (window.confirm(`Delete ${docToDelete.type} "${docToDelete.number}"?`)) {
      const updated = documents.filter((d) => d.id !== docId);
      setDocuments(updated);

      if (currentDoc.id === docId) {
        if (updated.length > 0) {
          setCurrentDoc(updated[0]);
        } else {
          setCurrentDoc(createBlankDocument('Invoice', []));
        }
      }
      showToast(`Document ${docToDelete.number} deleted.`);
    }
  };

  const handleDuplicateDocument = (doc: BillingDocument) => {
    const prefix = doc.type === 'Invoice' ? agencySettings.invoicePrefix : agencySettings.quotationPrefix;
    const nextNumber = generateNextDocumentNumber(doc.type, documents, prefix);
    const duplicated: BillingDocument = {
      ...doc,
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      number: nextNumber,
      paymentStatus: doc.type === 'Quotation' ? 'Draft' : 'Unpaid',
      amountPaid: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDocuments([duplicated, ...documents]);
    setCurrentDoc(duplicated);
    setIsSaved(true);
    setActiveTab('studio');
    showToast(`Duplicated into new document ${nextNumber}.`);
  };

  const handleConvertToInvoice = (quoteToConvert?: BillingDocument) => {
    const sourceQuote = quoteToConvert || currentDoc;
    if (sourceQuote.type !== 'Quotation') return;

    const newInvoice = convertQuoteToInvoice(
      sourceQuote,
      documents,
      agencySettings.invoicePrefix
    );

    setDocuments([newInvoice, ...documents]);
    setCurrentDoc(newInvoice);
    setIsSaved(true);
    setActiveTab('studio');
    showToast(`✓ Converted Quote ${sourceQuote.number} to Invoice ${newInvoice.number}!`);
  };

  const handleResetForm = () => {
    if (!isSaved) {
      if (!window.confirm('Discard unsaved modifications and start fresh?')) {
        return;
      }
    }
    handleNewDocument(currentDoc.type);
  };

  // CSV Ledger Exporter
  const handleExportCSV = () => {
    if (documents.length === 0) {
      showToast('No documents to export.');
      return;
    }

    const headers = [
      'Document Number',
      'Type',
      'Client Name',
      'Client Company',
      'Client Email',
      'Issue Date',
      'Due Date',
      'Currency',
      'Subtotal',
      'Discount %',
      'Discount Amount',
      'Tax %',
      'Tax Amount',
      'Grand Total',
      'Amount Paid',
      'Balance Due',
      'Payment Status',
    ];

    const rows = documents.map((d) => [
      `"${d.number}"`,
      `"${d.type}"`,
      `"${(d.client.name || '').replace(/"/g, '""')}"`,
      `"${(d.client.company || '').replace(/"/g, '""')}"`,
      `"${(d.client.email || '').replace(/"/g, '""')}"`,
      `"${d.issueDate}"`,
      `"${d.dueDate}"`,
      `"${d.currency}"`,
      d.totals.subtotal,
      d.totals.discountPercent,
      d.totals.discountAmount,
      d.totals.taxPercent,
      d.totals.taxAmount,
      d.totals.grandTotal,
      d.totals.amountPaid,
      d.totals.balanceDue,
      `"${d.paymentStatus}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Orbit360Hub-Ledger-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Exported CSV ledger successfully.');
  };

  // JSON Database Backup Exporter
  const handleExportJSON = () => {
    const backup = {
      agencySettings,
      documents,
      exportedAt: new Date().toISOString(),
      appVersion: '2.0.0',
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Orbit360Hub-Backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Database backup JSON exported.');
  };

  // JSON Database Backup Importer
  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        if (Array.isArray(parsed.documents)) {
          setDocuments(parsed.documents);
          if (parsed.documents.length > 0) {
            setCurrentDoc(parsed.documents[0]);
          }
        } else if (Array.isArray(parsed)) {
          setDocuments(parsed);
          if (parsed.length > 0) setCurrentDoc(parsed[0]);
        }

        if (parsed.agencySettings) {
          setAgencySettings({ ...DEFAULT_AGENCY_SETTINGS, ...parsed.agencySettings });
        }

        showToast('✓ Successfully restored database from backup file.');
      } catch (err) {
        showToast('❌ Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSamples = () => {
    const samples = getSampleDocuments();
    setDocuments(samples);
    setCurrentDoc(samples[0]);
    setIsSaved(true);
    showToast('Loaded sample Orbit360Hub agency documents.');
  };

  const handleSaveSettings = (newSettings: AgencySettings) => {
    setAgencySettings(newSettings);
    showToast('✓ Business settings updated.');
  };

  const handleResetSettings = () => {
    if (window.confirm('Reset business settings to Orbit360Hub defaults?')) {
      setAgencySettings(DEFAULT_AGENCY_SETTINGS);
      showToast('Reset to default agency settings.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-lime-400 selection:text-neutral-950">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-lime-400/50 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-lime-400 shrink-0" />
          {toastMessage}
        </div>
      )}

      {/* Main Navigation Header */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onNewDocument={() => handleNewDocument('Invoice')}
        documentCount={documents.length}
      />

      {/* Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: STUDIO (Editor & Live Preview Split) */}
        {activeTab === 'studio' && (
          <div className="space-y-6">
            {/* Context breadcrumb & quick actions */}
            <div className="no-print flex flex-wrap items-center justify-between gap-4 pb-2">
              <div>
                <div className="text-[11px] font-mono text-lime-400 tracking-widest uppercase">
                  ORBIT360HUB STUDIO / {currentDoc.type.toUpperCase()}
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                  {currentDoc.client.name
                    ? `${currentDoc.number} — ${currentDoc.client.name}`
                    : `${currentDoc.type} Editor`}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleNewDocument('Invoice')}
                  className="px-3 py-1.5 text-xs font-semibold bg-neutral-900 hover:bg-neutral-850 text-neutral-300 hover:text-white border border-neutral-800 rounded-xl transition-all"
                >
                  + New Invoice
                </button>
                <button
                  type="button"
                  onClick={() => handleNewDocument('Quotation')}
                  className="px-3 py-1.5 text-xs font-semibold bg-neutral-900 hover:bg-neutral-850 text-neutral-300 hover:text-white border border-neutral-800 rounded-xl transition-all"
                >
                  + New Quotation
                </button>
              </div>
            </div>

            {/* Split layout: Editor on left, Preview on right (stacks on mobile) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form Editor (5 cols on xl) */}
              <div className="xl:col-span-6 2xl:col-span-5 no-print editor-column">
                <InvoiceEditor
                  document={currentDoc}
                  agencySettings={agencySettings}
                  existingDocs={documents}
                  onUpdate={handleUpdateCurrentDoc}
                  onSave={handleSaveDocument}
                  onConvertToInvoice={
                    currentDoc.type === 'Quotation'
                      ? () => handleConvertToInvoice(currentDoc)
                      : undefined
                  }
                  onReset={handleResetForm}
                  isSaved={isSaved}
                />
              </div>

              {/* Right Column: Live Document Preview & Print Sheet (7 cols on xl) */}
              <div className="xl:col-span-6 2xl:col-span-7 printable-document-root">
                <InvoicePreview
                  document={currentDoc}
                  agencySettings={agencySettings}
                  onConvertToInvoice={
                    currentDoc.type === 'Quotation'
                      ? () => handleConvertToInvoice(currentDoc)
                      : undefined
                  }
                  onPrint={() => window.print()}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: DATABASE & HISTORY */}
        {activeTab === 'history' && (
          <DocumentHistory
            documents={documents}
            agencySettings={agencySettings}
            onOpenDocument={handleOpenDocument}
            onDeleteDocument={handleDeleteDocument}
            onDuplicateDocument={handleDuplicateDocument}
            onConvertToInvoice={handleConvertToInvoice}
            onExportJSON={handleExportJSON}
            onImportJSON={handleImportJSON}
            onExportCSV={handleExportCSV}
            onLoadSamples={handleLoadSamples}
          />
        )}

        {/* VIEW 3: AGENCY SETTINGS */}
        {activeTab === 'settings' && (
          <BusinessSettings
            settings={agencySettings}
            onSaveSettings={handleSaveSettings}
            onResetDefaults={handleResetSettings}
          />
        )}
      </main>

      {/* Quiet Minimalist Footer */}
      <footer className="no-print border-t border-neutral-900 py-6 mt-12 bg-neutral-950 text-neutral-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <OrbitLogo variant="mark" theme="dark" size="sm" />
            <span className="font-semibold text-neutral-300">Orbit360Hub</span>
            <span>·</span>
            <span>Professional Agency Billing System</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-neutral-400">
            <span>Bangladeshi Taka (BDT ৳) Standard</span>
            <span>·</span>
            <span>Client PDF Print Vector Engine</span>
            <span>·</span>
            <button
              type="button"
              onClick={handleLoadSamples}
              className="hover:text-lime-400 transition-colors"
            >
              Reload Sample Data
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
