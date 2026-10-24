import React, { useState } from 'react';
import { PaymentRecord } from '../../../types';
import { CreditCard, CheckCircle2, X, Calendar, Hash, FileText } from 'lucide-react';

interface ClientSubmitPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentRecord | null;
  onSubmit: (
    paymentId: string,
    details: {
      paidDate: string;
      paymentMethod: string;
      transactionReference: string;
      notes?: string;
    }
  ) => void;
}

export const ClientSubmitPaymentModal: React.FC<ClientSubmitPaymentModalProps> = ({
  isOpen,
  onClose,
  payment,
  onSubmit,
}) => {
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer (NEFT/RTGS)');
  const [transactionReference, setTransactionReference] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen || !payment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(payment.id, {
      paidDate,
      paymentMethod,
      transactionReference: transactionReference.trim() || `UTR-${Date.now()}`,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Submit Payment Confirmation
              </h3>
              <p className="text-xs text-slate-500">
                Invoice #{payment.invoiceNumber} &bull; {payment.billingMonth}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invoice Summary */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">
              {payment.title}
            </div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">
              Due Date: <span className="font-mono">{payment.dueDate || 'Immediate'}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-slate-900">
              {payment.currencySymbol}{payment.amount.toLocaleString()}
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Client Portal
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Payment Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Payment Transfer Date *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="date"
                required
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Payment Method Used *
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              >
                <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT / RTGS / IMPS)</option>
                <option value="UPI / Corporate NetBanking">UPI / Corporate NetBanking</option>
                <option value="Stripe / Credit Card">Corporate Credit Card</option>
                <option value="Wire Transfer">International Wire Transfer</option>
                <option value="Cheque / Draft">Demand Draft / Cheque</option>
              </select>
            </div>
          </div>

          {/* Transaction Reference / UTR Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bank Transaction Reference (UTR / Txn ID) *
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="Enter bank transfer UTR or transaction ID"
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              This reference is recorded directly into the company ledger for verification.
            </p>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Remarks or Account Note (Optional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Paid via corporate account ending in 4091"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Submit Payment Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
