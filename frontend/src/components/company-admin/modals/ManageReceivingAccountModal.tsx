import React, { useState, useEffect } from 'react';
import { CompanyAdminMetric } from '../../../types';
import {
  Landmark,
  X,
  CreditCard,
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

interface ManageReceivingAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCompany: CompanyAdminMetric | null;
  onSave: (updated: CompanyAdminMetric) => void;
}

export const ManageReceivingAccountModal: React.FC<ManageReceivingAccountModalProps> = ({
  isOpen,
  onClose,
  currentCompany,
  onSave,
}) => {
  const [bankName, setBankName] = useState('HDFC Bank');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountType, setAccountType] = useState('Current Account');
  const [upiId, setUpiId] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (currentCompany) {
      setBankName(currentCompany.bankName || 'HDFC Bank');
      setAccountHolderName(
        currentCompany.accountHolderName || currentCompany.companyName || 'Corporate Billing Desk'
      );
      setAccountNumber(currentCompany.accountNumber || '50200084920192');
      setIfscCode(currentCompany.ifscCode || 'HDFC0001234');
      setAccountType(currentCompany.accountType || 'Current Account');
      setUpiId(
        currentCompany.upiId ||
          `${(currentCompany.companyName || 'company').toLowerCase().replace(/[^a-z0-9]/g, '')}@hdfcbank`
      );
    }
  }, [currentCompany, isOpen]);

  if (!isOpen || !currentCompany) return null;

  const handleCopy = (field: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CompanyAdminMetric = {
      ...currentCompany,
      bankName,
      accountHolderName,
      accountNumber,
      ifscCode,
      accountType,
      upiId,
    };
    onSave(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  // Masked account number for security preview
  const maskedAccountNumber =
    accountNumber.length > 4
      ? '•••• •••• •••• ' + accountNumber.slice(-4)
      : accountNumber || '•••• •••• •••• 0192';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold shadow-2xs">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 text-base">
                  Receiving Bank & Payment Accounts
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Payout</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure the receiving bank account & UPI ID where clients will send payments for this company.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Client Preview Cards */}
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Client Live Checkout Preview (How Clients See Your Account)</span>
            <span className="text-blue-600 font-bold lowercase text-[10px]">Real-Time Sync</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Metallic Virtual Bank Card */}
            <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-900 text-white rounded-2xl p-4 shadow-lg border border-slate-700 relative overflow-hidden flex flex-col justify-between h-44">
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-center justify-between z-10">
                <div className="flex items-center space-x-1.5">
                  <Landmark className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black tracking-wide text-amber-300">
                    {bankName || 'Corporate Bank'}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-white/10 px-2 py-0.5 rounded-md border border-white/15">
                  {accountType}
                </span>
              </div>

              {/* Chip & Contactless */}
              <div className="flex items-center space-x-3 my-auto z-10">
                <div className="w-9 h-6 rounded bg-amber-400/80 border border-amber-300/60 shadow-inner flex items-center justify-center">
                  <div className="w-7 h-4 border border-amber-700/40 rounded-xs grid grid-cols-2 gap-0.5 opacity-60"></div>
                </div>
                <div className="text-sm font-mono tracking-widest font-black text-slate-100">
                  {maskedAccountNumber}
                </div>
              </div>

              <div className="flex items-center justify-between z-10 pt-1 border-t border-white/10 text-[10px]">
                <div>
                  <span className="text-slate-400 block uppercase text-[8px] font-semibold">
                    Beneficiary Name
                  </span>
                  <span className="font-bold text-slate-100 truncate max-w-[170px] block">
                    {accountHolderName || currentCompany.companyName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block uppercase text-[8px] font-semibold">IFSC</span>
                  <span className="font-mono font-bold text-amber-300">{ifscCode || 'HDFC0001234'}</span>
                </div>
              </div>
            </div>

            {/* UPI & QR Code Preview Widget */}
            <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-slate-50 border border-blue-200 rounded-2xl p-4 flex flex-col justify-between h-44 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-[10px]">
                    UPI
                  </span>
                  <span className="text-xs font-black text-slate-900">Instant UPI & QR</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                  Auto-Settling
                </span>
              </div>

              <div className="flex items-center space-x-3 my-auto">
                {/* Visual SVG QR Box */}
                <div className="w-16 h-16 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                    {/* Simplified QR geometry representation */}
                    <rect x="0" y="0" width="30" height="30" rx="3" />
                    <rect x="5" y="5" width="20" height="20" fill="white" />
                    <rect x="10" y="10" width="10" height="10" />
                    <rect x="70" y="0" width="30" height="30" rx="3" />
                    <rect x="75" y="5" width="20" height="20" fill="white" />
                    <rect x="80" y="10" width="10" height="10" />
                    <rect x="0" y="70" width="30" height="30" rx="3" />
                    <rect x="5" y="75" width="20" height="20" fill="white" />
                    <rect x="10" y="80" width="10" height="10" />
                    <rect x="40" y="10" width="15" height="10" />
                    <rect x="40" y="30" width="25" height="15" />
                    <rect x="70" y="45" width="15" height="15" />
                    <rect x="40" y="60" width="10" height="25" />
                    <rect x="60" y="70" width="25" height="10" />
                  </svg>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="text-[11px] text-slate-500 font-medium">Merchant VPA / UPI ID:</div>
                  <div className="font-mono font-bold text-blue-700 bg-white px-2 py-1 rounded-lg border border-blue-200 select-all truncate max-w-[140px]">
                    {upiId}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Supports GPay, PhonePe, Paytm, BHIM & NetBanking apps.
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 border-t border-blue-100 pt-1 flex items-center justify-between">
                <span>Receiving as: <strong className="text-slate-800">{currentCompany.companyName}</strong></span>
                <span className="font-bold text-blue-600">0% Gateway Fee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSave} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Account Holder Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account Holder / Beneficiary Name *
              </label>
              <input
                type="text"
                required
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="e.g. Acme Enterprise Solutions Pvt Ltd"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-800"
              />
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bank Name *
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-800"
              >
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                <option value="Punjab National Bank (PNB)">Punjab National Bank (PNB)</option>
                <option value="Bank of Baroda">Bank of Baroda</option>
                <option value="Yes Bank">Yes Bank</option>
                <option value="Standard Chartered">Standard Chartered</option>
                <option value="HSBC Bank">HSBC Bank</option>
                <option value="Other Corporate Bank">Other Corporate Bank</option>
              </select>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bank Account Number *
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 50200084920192"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-bold text-slate-800"
              />
            </div>

            {/* IFSC Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                IFSC Code *
              </label>
              <input
                type="text"
                required
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="e.g. HDFC0001234"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-bold text-slate-800 uppercase"
              />
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account Type
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-800"
              >
                <option value="Current Account">Current Account (Corporate / Business)</option>
                <option value="Savings Account">Savings Account</option>
                <option value="Escrow Account">Escrow Settlement Account</option>
              </select>
            </div>

            {/* Company UPI ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Business UPI ID / VPA *
              </label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. acmebilling@hdfcbank"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-bold text-blue-700"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              All client payments made through <strong>Card</strong>, <strong>NetBanking</strong>, <strong>UPI / QR</strong>, or <strong>Direct Transfer</strong> will be deposited directly to this bank account. Real-time confirmation records will be posted in your Payments Tracker ledger.
            </span>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saveSuccess}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:bg-emerald-600"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Receiving Account Saved!</span>
                </>
              ) : (
                <>
                  <Landmark className="w-4 h-4" />
                  <span>Save Receiving Account Details</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
