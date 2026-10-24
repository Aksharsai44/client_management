import React, { useState } from 'react';
import { PaymentRecord } from '../../../types';
import { Mail, Send, X, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface SendReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentRecord | null;
  onSend: (paymentId: string) => Promise<{ success: boolean; message: string; emailDetails?: any }>;
}

export const SendReminderModal: React.FC<SendReminderModalProps> = ({
  isOpen,
  onClose,
  payment,
  onSend,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen || !payment) return null;

  const handleSend = async () => {
    setIsSending(true);
    try {
      const res = await onSend(payment.id);
      setResult(res);
      setTimeout(() => {
        setResult(null);
        setIsSending(false);
        onClose();
      }, 2000);
    } catch {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Dispatch Payment Reminder Email
              </h3>
              <p className="text-xs text-slate-500">
                To: {payment.clientName} ({payment.clientEmail || 'client@example.com'})
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

        {result ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">{result.message}</h4>
            <p className="text-xs text-slate-500">
              Notification recorded in real-time database.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Email Preview Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-500">Recipient:</span>
                <span className="font-mono text-blue-600 font-bold">{payment.clientEmail}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-500">Subject:</span>
                <span className="font-bold text-slate-800">
                  Payment Reminder: {payment.currencySymbol}{payment.amount.toLocaleString()} Due for {payment.billingMonth}
                </span>
              </div>
              <div className="pt-1 text-slate-700 leading-relaxed font-sans bg-white p-3 rounded-lg border border-slate-100">
                <p className="font-medium">Dear {payment.clientName},</p>
                <p className="mt-2 text-slate-600">
                  This is a friendly reminder that the payment for invoice{' '}
                  <span className="font-mono font-bold text-slate-800">{payment.invoiceNumber}</span>{' '}
                  (<strong>{payment.title}</strong>) is scheduled for settlement.
                </p>
                <div className="my-2.5 p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-lg text-amber-900 flex items-center justify-between">
                  <span>Total Amount Due:</span>
                  <span className="font-black text-sm text-slate-900">
                    {payment.currencySymbol}{payment.amount.toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Due Date: <strong>{payment.dueDate || 'Immediate'}</strong>. Please process the bank transfer or share the transaction reference (UTR) in your client dashboard.
                </p>
                <p className="mt-3 text-[11px] text-slate-500 font-medium">
                  Regards,<br />
                  Finance & Accounts Department
                </p>
              </div>
            </div>

            {payment.status === 'overdue' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2.5 text-xs text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  This invoice is past its due date ({payment.dueDate}). An urgent reminder flag will be attached.
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSending}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Sending Reminder...' : 'Send Reminder Email'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
