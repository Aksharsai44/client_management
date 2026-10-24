import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentRecord, ProjectMOU } from '../../types';
import {
  CreditCard,
  FileSignature,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Download,
  Calendar,
  Building2,
  ArrowRight,
  ShieldCheck,
  FileText,
  Printer,
  Sparkles,
} from 'lucide-react';
import { ClientPaymentGatewayModal } from './modals/ClientPaymentGatewayModal';
import { ViewMouModal } from '../company-admin/modals/ViewMouModal';

export const ClientPaymentsTab: React.FC = () => {
  const { currentUser, payments, projectMous, companyAdminMetrics, markPaymentPaid } = useApp();

  const today = new Date();
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  const [submitTargetPayment, setSubmitTargetPayment] = useState<PaymentRecord | null>(null);
  const [viewingMou, setViewingMou] = useState<ProjectMOU | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Scoped payments for this client
  const clientPayments = useMemo(() => {
    return payments.filter((p) => {
      if (currentUser?.email && p.clientEmail?.toLowerCase() === currentUser.email.toLowerCase()) return true;
      if (currentUser?.name && p.clientName?.toLowerCase() === currentUser.name.toLowerCase()) return true;
      if (currentUser?.companyName && p.clientName?.toLowerCase().includes(currentUser.companyName.toLowerCase())) return true;
      if (currentUser?.companyId && p.companyId === currentUser.companyId) return true;
      return false;
    });
  }, [payments, currentUser]);

  // Scoped MOUs for this client
  const clientMous = useMemo(() => {
    return projectMous.filter((m) => {
      if (currentUser?.email && m.clientEmail?.toLowerCase() === currentUser.email.toLowerCase()) return true;
      if (currentUser?.name && m.clientName?.toLowerCase() === currentUser.name.toLowerCase()) return true;
      if (currentUser?.companyName && m.clientName?.toLowerCase().includes(currentUser.companyName.toLowerCase())) return true;
      if (currentUser?.companyId && m.companyId === currentUser.companyId) return true;
      return false;
    });
  }, [projectMous, currentUser]);

  const activeMou = clientMous[0] || null;

  // Find this month's payment record
  const currentMonthPayment = useMemo(() => {
    return clientPayments.find((p) => p.billingMonth === currentMonthKey) || clientPayments[0] || null;
  }, [clientPayments, currentMonthKey]);

  const totalPaidSum = clientPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = clientPayments.filter((p) => p.status !== 'paid');

  // Resolve receiving company organization details (admin's bank and UPI details)
  const receivingCompany = useMemo(() => {
    const targetCompanyId =
      submitTargetPayment?.companyId || currentMonthPayment?.companyId || currentUser?.companyId;
    if (targetCompanyId) {
      const matched = companyAdminMetrics.find(
        (c) => c.companyAdminId === targetCompanyId || c.id === targetCompanyId
      );
      if (matched) return matched;
    }
    return companyAdminMetrics[0] || null;
  }, [companyAdminMetrics, submitTargetPayment, currentMonthPayment, currentUser]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-600 hover:text-emerald-800">
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Payments, Agreements & Billing
              </h1>
              <p className="text-xs text-slate-500">
                Track your active project MOU terms, verify monthly retainer payments, and submit settlement details.
              </p>
            </div>
          </div>
        </div>

        {activeMou && (
          <button
            onClick={() => setViewingMou(activeMou)}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer self-start sm:self-center"
          >
            <FileSignature className="w-4 h-4 text-blue-600" />
            <span>View Signed MOU Terms</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* THIS MONTH PAYMENT STATUS HIGHLIGHT CARD (Requested Feature)             */}
      {/* ========================================================================= */}
      {currentMonthPayment ? (
        <div
          className={`border rounded-2xl p-6 shadow-xs relative overflow-hidden ${
            currentMonthPayment.status === 'paid'
              ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-50/50 to-white border-emerald-200'
              : currentMonthPayment.status === 'overdue'
              ? 'bg-gradient-to-br from-rose-500/10 via-rose-50/50 to-white border-rose-200'
              : 'bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-white border-amber-200'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                    currentMonthPayment.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : currentMonthPayment.status === 'overdue'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {currentMonthPayment.billingMonth === currentMonthKey
                    ? `Current Billing Cycle (${currentMonthName})`
                    : `Cycle: ${currentMonthPayment.billingMonth}`}
                </span>
                <span className="text-xs text-slate-500 font-mono font-medium">
                  Invoice #{currentMonthPayment.invoiceNumber}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {currentMonthPayment.status === 'paid' && (
                    <span className="text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      Payment Completed & Verified for This Month
                    </span>
                  )}
                  {currentMonthPayment.status === 'pending' && (
                    <span className="text-amber-900 flex items-center gap-2">
                      <Clock className="w-6 h-6 text-amber-600 shrink-0" />
                      Payment Pending for {currentMonthName}
                    </span>
                  )}
                  {currentMonthPayment.status === 'overdue' && (
                    <span className="text-rose-900 flex items-center gap-2">
                      <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
                      Payment Overdue for {currentMonthName}
                    </span>
                  )}
                </h2>

                <p className="text-xs text-slate-600 mt-1">
                  {currentMonthPayment.status === 'paid'
                    ? `Settled via ${currentMonthPayment.paymentMethod || 'Bank Transfer'} with Reference ${currentMonthPayment.transactionReference}. Thank you for your continued partnership!`
                    : `Your monthly project retainer fee of ${currentMonthPayment.currencySymbol}${currentMonthPayment.amount.toLocaleString()} is due on ${currentMonthPayment.dueDate}.`}
                </p>
              </div>

              {/* Transaction / Due Date Meta */}
              <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                <div className="bg-white/80 border border-slate-200/80 px-3 py-1.5 rounded-xl">
                  <span className="text-slate-500 text-[10px] block font-bold uppercase">
                    Amount
                  </span>
                  <span className="font-black text-base text-slate-900">
                    {currentMonthPayment.currencySymbol}{currentMonthPayment.amount.toLocaleString()}
                  </span>
                </div>

                <div className="bg-white/80 border border-slate-200/80 px-3 py-1.5 rounded-xl">
                  <span className="text-slate-500 text-[10px] block font-bold uppercase">
                    Due Date
                  </span>
                  <span className="font-bold text-slate-800 font-mono">
                    {currentMonthPayment.dueDate || 'N/A'}
                  </span>
                </div>

                {currentMonthPayment.status === 'paid' && (
                  <>
                    <div className="bg-white/80 border border-slate-200/80 px-3 py-1.5 rounded-xl">
                      <span className="text-slate-500 text-[10px] block font-bold uppercase">
                        Settled On
                      </span>
                      <span className="font-bold text-slate-800 font-mono">
                        {currentMonthPayment.paidDate}
                      </span>
                    </div>

                    <div className="bg-white/80 border border-slate-200/80 px-3 py-1.5 rounded-xl">
                      <span className="text-slate-500 text-[10px] block font-bold uppercase">
                        Bank Ref / UTR
                      </span>
                      <span className="font-mono font-bold text-blue-700">
                        {currentMonthPayment.transactionReference || 'Verified'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="shrink-0 self-start md:self-center">
              {currentMonthPayment.status !== 'paid' ? (
                <button
                  onClick={() => setSubmitTargetPayment(currentMonthPayment)}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-2 cursor-pointer hover:shadow-lg"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Now (UPI, Card, NetBanking)</span>
                </button>
              ) : (
                <div className="px-4 py-2.5 bg-emerald-100/80 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>All Clear &bull; No Dues This Month</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
          No pending payment obligations for this organization.
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROJECT MOU & CONTRACT SUMMARY CARD                                      */}
      {/* ========================================================================= */}
      {activeMou && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <FileSignature className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Active Project Agreement & MOU
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {activeMou.projectTitle}
                </p>
              </div>
            </div>
            <button
              onClick={() => setViewingMou(activeMou)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>Read Agreement Clauses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Contract Value</span>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {activeMou.currencySymbol}{activeMou.totalAmount.toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Retainer</span>
              <div className="text-base font-black text-blue-700 mt-0.5">
                {activeMou.currencySymbol}{activeMou.monthlyAmount.toLocaleString()} / mo
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Billing Day</span>
              <div className="text-sm font-bold text-slate-800 mt-0.5">
                {activeMou.billingDayOfMonth}th of each month
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Agreement Period</span>
              <div className="text-sm font-semibold text-slate-700 mt-0.5">
                {activeMou.startDate} &rarr; {activeMou.endDate || 'Ongoing'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAYMENT HISTORY & INVOICE LEDGER TABLE                                   */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Invoices & Payment Settlement History ({clientPayments.length})
            </h3>
            <p className="text-xs text-slate-500">
              Historical record of your monthly fees, invoice statements, and receipt references
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-700">
            Total Settled: <strong className="text-emerald-700 font-black">₹{totalPaidSum.toLocaleString()}</strong>
          </div>
        </div>

        {clientPayments.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500 font-medium">
            No invoices generated yet for this client account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Cycle Month</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Settlement Reference</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {clientPayments.map((p) => {
                  const isPaid = p.status === 'paid';
                  const isOverdue = p.status === 'overdue';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {p.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {p.billingMonth}
                      </td>
                      <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-800" title={p.title}>
                        {p.title}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {p.dueDate || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-black text-slate-900 text-sm">
                          {p.currencySymbol}{p.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isPaid ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Done &bull; Settled</span>
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Overdue</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isPaid ? (
                          <div className="space-y-0.5">
                            <div className="font-mono text-xs font-bold text-slate-900">
                              {p.transactionReference || 'Cleared'}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Paid {p.paidDate} ({p.paymentMethod || 'Bank Transfer'})
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Awaiting settlement</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!isPaid ? (
                          <button
                            onClick={() => setSubmitTargetPayment(p)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center space-x-1"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay Now</span>
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-bold text-xs">
                            Receipt Verified &bull; OK
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MULTI-METHOD PAYMENT GATEWAY MODAL */}
      {submitTargetPayment && (
        <ClientPaymentGatewayModal
          isOpen={!!submitTargetPayment}
          onClose={() => setSubmitTargetPayment(null)}
          payment={submitTargetPayment}
          receivingCompany={receivingCompany}
          onPaymentComplete={(paymentId, details) => {
            markPaymentPaid(paymentId, details);
            setSuccessToast(
              `Payment of ${submitTargetPayment.currencySymbol}${submitTargetPayment.amount.toLocaleString()} completed and verified! Status updated to PAID across both Client & Company Admin portals.`
            );
          }}
        />
      )}

      {viewingMou && (
        <ViewMouModal
          isOpen={!!viewingMou}
          onClose={() => setViewingMou(null)}
          mou={viewingMou}
        />
      )}
    </div>
  );
};
