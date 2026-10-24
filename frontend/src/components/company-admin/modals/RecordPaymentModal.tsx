import React, { useState } from 'react';
import { PaymentRecord } from '../../../types';
import { CheckCircle2, X, CreditCard, Calendar, Hash, FileText } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentRecord | null;
  onRecord: (
    paymentId: string,
    details: {
      paidDate: string;
      paymentMethod: string;
      transactionReference: string;
      notes?: string;
    }
  ) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  payment,
  onRecord,
}) => {
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer (NEFT/RTGS)');
  const [transactionReference, setTransactionReference] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen || !payment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRecord(payment.id, {
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
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Record Payment / Mark as Done
              </h3>
              <p className="text-xs text-slate-500">
                Invoice #{payment.invoiceNumber} &bull; {payment.clientName}
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

        {/* Invoice Summary Card */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {payment.title}
            </div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">
              Due Date: <span className="font-mono">{payment.dueDate || 'N/A'}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-slate-900">
              {payment.currencySymbol}{payment.amount.toLocaleString()}
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Pending Verification
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Paid Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Payment Settlement Date *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="date"
                required
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Payment Method *
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
              >
                <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT / RTGS / IMPS)</option>
                <option value="UPI / Corporate NetBanking">UPI / Corporate NetBanking</option>
                <option value="Stripe / Credit Card">Corporate Credit Card / Stripe</option>
                <option value="Wire Transfer">International Wire Transfer</option>
                <option value="Cheque / Draft">Demand Draft / Cheque</option>
              </select>
            </div>
          </div>

          {/* Transaction Reference / UTR */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bank Transaction Ref / UTR Number *
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="e.g. UTR-9823481234 or TXN-492817"
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-800"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Internal Reconciliation Notes
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Received via HDFC Current Account, cleared on same day."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm & Mark as Done</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
