import React, { useState } from 'react';
import {
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  CreditCard,
  FileCheck,
  CheckCircle,
  RotateCcw,
  Save,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import type { AgencySettings } from '../types/billing';
import { DEFAULT_AGENCY_SETTINGS, SUPPORTED_CURRENCIES } from '../utils/billing';

interface BusinessSettingsProps {
  settings: AgencySettings;
  onSaveSettings: (newSettings: AgencySettings) => void;
  onResetDefaults: () => void;
}

export const BusinessSettings: React.FC<BusinessSettingsProps> = ({
  settings: initialSettings,
  onSaveSettings,
  onResetDefaults,
}) => {
  const [formData, setFormData] = useState<AgencySettings>({ ...initialSettings });
  const [saveToast, setSaveToast] = useState(false);

  const handleChange = <K extends keyof AgencySettings>(
    field: K,
    value: AgencySettings[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBankChange = (field: keyof AgencySettings['bankDetails'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value,
      },
    }));
  };

  const handleMobileChange = (
    field: keyof AgencySettings['mobileBanking'],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      mobileBanking: {
        ...prev.mobileBanking,
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <div className="settings-view max-w-4xl mx-auto space-y-6">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-lime-400" />
              Agency & Billing Settings
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Configure Orbit360Hub's official corporate details, international banking rails, and default terms.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-lime-400 text-neutral-950 hover:bg-lime-300 rounded-xl transition-all shadow-md active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              Save Settings
            </button>
          </div>
        </div>

        {saveToast && (
          <div className="mt-4 p-3 bg-lime-950/70 border border-lime-800/40 text-lime-300 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-lime-400" />
            Agency settings saved successfully to local browser database.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          {/* 1. General Profile */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Agency Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Agency Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Tagline / Brand Philosophy
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Official Website
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Tax Registration / BIN / TIN
                </label>
                <input
                  type="text"
                  value={formData.taxNumber}
                  onChange={(e) => handleChange('taxNumber', e.target.value)}
                  placeholder="e.g. BIN: 004819230-0101"
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Physical Office Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>
          </div>

          {/* 2. Bank Wire Details */}
          <div className="space-y-4 pt-4 border-t border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-lime-400" />
              Corporate Bank Wire Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankDetails.bankName}
                  onChange={(e) => handleBankChange('bankName', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={formData.bankDetails.accountName}
                  onChange={(e) => handleBankChange('accountName', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.bankDetails.accountNumber}
                  onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={formData.bankDetails.branchName || ''}
                  onChange={(e) => handleBankChange('branchName', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Routing Number
                </label>
                <input
                  type="text"
                  value={formData.bankDetails.routingNumber || ''}
                  onChange={(e) => handleBankChange('routingNumber', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  SWIFT / BIC Code
                </label>
                <input
                  type="text"
                  value={formData.bankDetails.swiftCode || ''}
                  onChange={(e) => handleBankChange('swiftCode', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* 3. Mobile Financial Services (bKash & Nagad) */}
          <div className="space-y-4 pt-4 border-t border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-lime-400" />
              Mobile Banking (bKash & Nagad)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  bKash Number
                </label>
                <input
                  type="text"
                  value={formData.mobileBanking.bKashNumber || ''}
                  onChange={(e) => handleMobileChange('bKashNumber', e.target.value)}
                  placeholder="01327376359"
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  bKash Account Type
                </label>
                <select
                  value={formData.mobileBanking.bKashType || 'Merchant'}
                  onChange={(e) => handleMobileChange('bKashType', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400"
                >
                  <option value="Merchant">Merchant Account</option>
                  <option value="Personal">Personal Account</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Nagad Number
                </label>
                <input
                  type="text"
                  value={formData.mobileBanking.nagadNumber || ''}
                  onChange={(e) => handleMobileChange('nagadNumber', e.target.value)}
                  placeholder="01327376359"
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* 4. Document Numbering & Default Terms */}
          <div className="space-y-4 pt-4 border-t border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Numbering & Legal Defaults
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Invoice Prefix
                </label>
                <input
                  type="text"
                  value={formData.invoicePrefix}
                  onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Quotation Prefix
                </label>
                <input
                  type="text"
                  value={formData.quotationPrefix}
                  onChange={(e) => handleChange('quotationPrefix', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Default Payment Terms
                </label>
                <input
                  type="text"
                  value={formData.defaultPaymentTerms}
                  onChange={(e) => handleChange('defaultPaymentTerms', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Default Scope & Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.defaultNotes}
                  onChange={(e) => handleChange('defaultNotes', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-lime-400 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider bg-lime-400 text-neutral-950 hover:bg-lime-300 rounded-xl transition-all shadow-lg active:scale-95"
            >
              <Save className="w-4 h-4" />
              Save Business Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
