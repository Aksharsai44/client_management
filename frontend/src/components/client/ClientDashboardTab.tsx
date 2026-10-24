import React, { useState, useMemo } from 'react';
import { Meeting, ResourceItem, CommunityPost, AttendanceRecord, User, PaymentRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Video,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  QrCode,
  Landmark,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Receipt,
  ExternalLink,
} from 'lucide-react';
import { ClientPaymentGatewayModal } from './modals/ClientPaymentGatewayModal';

interface ClientDashboardTabProps {
  batchMeetings: Meeting[];
  clientAttendanceRate: number;
  batchResources: ResourceItem[];
  batchPosts: CommunityPost[];
  attendanceRecords: AttendanceRecord[];
  activeBatchId: string;
  currentUser: User;
  setActiveTab: (tab: any) => void;
}

export const ClientDashboardTab: React.FC<ClientDashboardTabProps> = ({
  batchMeetings,
  clientAttendanceRate,
  batchResources,
  batchPosts,
  attendanceRecords,
  activeBatchId,
  currentUser,
  setActiveTab,
}) => {
  const { payments, companyAdminMetrics, markPaymentPaid } = useApp();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const today = new Date();
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  // 1. Scoped payments for this client
  const clientPayments = useMemo(() => {
    return payments.filter((p) => {
      if (currentUser?.email && p.clientEmail?.toLowerCase() === currentUser.email.toLowerCase()) return true;
      if (currentUser?.name && p.clientName?.toLowerCase() === currentUser.name.toLowerCase()) return true;
      if (currentUser?.companyName && p.clientName?.toLowerCase().includes(currentUser.companyName.toLowerCase())) return true;
      if (currentUser?.companyId && p.companyId === currentUser.companyId) return true;
      return false;
    });
  }, [payments, currentUser]);

  // Priority: 1st unpaid payment, or current month payment, or most recent
  const activePayment = useMemo(() => {
    const pending = clientPayments.find((p) => p.status !== 'paid');
    if (pending) return pending;
    const thisMonth = clientPayments.find((p) => p.billingMonth === currentMonthKey);
    if (thisMonth) return thisMonth;
    return clientPayments[0] || null;
  }, [clientPayments, currentMonthKey]);

  // Resolve receiving company organization details (admin's receiving bank & UPI)
  const receivingCompany = useMemo(() => {
    const targetCompanyId = activePayment?.companyId || currentUser?.companyId;
    if (targetCompanyId) {
      const matched = companyAdminMetrics.find(
        (c) => c.companyAdminId === targetCompanyId || c.id === targetCompanyId
      );
      if (matched) return matched;
    }
    return companyAdminMetrics[0] || null;
  }, [companyAdminMetrics, activePayment, currentUser]);

  const upcomingMeetings = batchMeetings.filter((m) => m.status === 'upcoming');
  const nextMeeting = upcomingMeetings[0];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAYMENT OBLIGATION & 1-CLICK CHECKOUT HERO BANNER                          */}
      {/* ========================================================================= */}
      {activePayment && (
        <div
          className={`border rounded-2xl p-6 shadow-xs relative overflow-hidden transition-all ${
            activePayment.status === 'paid'
              ? 'bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-emerald-200'
              : activePayment.status === 'overdue'
              ? 'bg-gradient-to-r from-rose-50 via-red-50/40 to-white border-rose-300'
              : 'bg-gradient-to-r from-amber-50/80 via-blue-50/30 to-white border-amber-300'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    activePayment.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : activePayment.status === 'overdue'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {activePayment.status === 'paid'
                    ? 'Payment Settled & Verified'
                    : activePayment.status === 'overdue'
                    ? 'Payment Overdue • Action Required'
                    : 'Payment Due • Action Required'}
                </span>

                <span className="text-xs text-slate-500 font-mono">
                  Invoice #{activePayment.invoiceNumber}
                </span>

                <span className="text-xs text-slate-400 font-medium">
                  &bull; Billing Cycle: {activePayment.billingMonth || currentMonthName}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  {activePayment.status === 'paid' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>{currentMonthName} Payment Complete</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>Outstanding Invoice: {activePayment.currencySymbol}{activePayment.amount.toLocaleString()}</span>
                    </>
                  )}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {activePayment.status === 'paid'
                    ? `Settled on ${activePayment.paidDate} via ${activePayment.paymentMethod || 'Online Payment'} (Ref: ${activePayment.transactionReference}). All services active.`
                    : `Project retainer fee of ${activePayment.currencySymbol}${activePayment.amount.toLocaleString()} is due on ${activePayment.dueDate}. You can complete payment instantly via UPI, Card, NetBanking, or Bank Transfer.`}
                </p>
              </div>

              {/* Supported payment methods badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="inline-flex items-center space-x-1 text-[11px] font-bold text-slate-600 bg-white/90 border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
                  <QrCode className="w-3.5 h-3.5 text-blue-600" />
                  <span>Instant UPI QR</span>
                </div>
                <div className="inline-flex items-center space-x-1 text-[11px] font-bold text-slate-600 bg-white/90 border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Cards (Visa/MC)</span>
                </div>
                <div className="inline-flex items-center space-x-1 text-[11px] font-bold text-slate-600 bg-white/90 border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
                  <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                  <span>NetBanking</span>
                </div>
                {receivingCompany?.bankName && (
                  <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                    &bull; Payout routes to {receivingCompany.companyName} ({receivingCompany.bankName})
                  </span>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="shrink-0 flex flex-wrap items-center gap-3">
              {activePayment.status !== 'paid' ? (
                <button
                  onClick={() => setPaymentModalOpen(true)}
                  className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-blue-200" />
                  <span>Pay {activePayment.currencySymbol}{activePayment.amount.toLocaleString()} Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="px-4 py-2.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>No Dues Pending</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <Receipt className="w-3.5 h-3.5 text-slate-500" />
                    <span>Billing History</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Key Analytics & Attendance Progress */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Upcoming Sessions</span>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {upcomingMeetings.length}
          </div>
          <span className="text-[10px] text-blue-600 font-medium">Ready for 1-Click Entry</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Your Attendance Index</span>
          <div className="text-2xl font-black text-emerald-600 mt-2">{clientAttendanceRate}%</div>
          <span className="text-[10px] text-emerald-700 font-medium">Verified Presence</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Batch Documents</span>
          <div className="text-2xl font-black text-slate-900 mt-2">{batchResources.length}</div>
          <span className="text-[10px] text-amber-600 font-medium">Reports & Blueprints</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Team Community</span>
          <div className="text-2xl font-black text-slate-900 mt-2">{batchPosts.length}</div>
          <span className="text-[10px] text-purple-600 font-medium">Discussion Topics</span>
        </div>
      </div>

      {/* Upcoming Meeting Call Card + Mini Calendar */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Video className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Upcoming Client Checkpoint & Meeting
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('meetings')}
              className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
            >
              View All Meetings &rarr;
            </button>
          </div>

          {nextMeeting ? (
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  {nextMeeting.scheduleType}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">{nextMeeting.title}</h4>
                <p className="text-xs text-slate-600 mt-0.5">{nextMeeting.description}</p>
                <div className="flex items-center space-x-4 mt-3 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {nextMeeting.dateTime.replace('T', ' ')}
                  </span>
                  <span>{nextMeeting.durationMinutes} mins</span>
                  <span>Host: {nextMeeting.hostName}</span>
                </div>
              </div>

              <a
                href={nextMeeting.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center justify-center space-x-2 shadow-xs shrink-0 transition-transform hover:scale-102"
              >
                <Video className="w-4 h-4" />
                <span>Join Call Directly</span>
              </a>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
              No upcoming calls scheduled today.
            </div>
          )}
        </div>

        {/* Mini Calendar Widget */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs">Calendar & Attendance</h4>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-[11px] text-emerald-700 font-semibold cursor-pointer"
            >
              View Attendance
            </button>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="text-center font-bold text-xs text-slate-800 mb-2">October 2026</div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-500 mb-1">
              <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {Array.from({ length: 31 }, (_, i) => {
                const day = i + 1;
                const dateStr = `2026-10-${day < 10 ? '0' + day : day}`;
                const rec = attendanceRecords.find(
                  (r) =>
                    r.batchId === activeBatchId &&
                    r.date === dateStr &&
                    r.userId === currentUser.id
                );
                const isPresent = rec?.status === 'present';
                const isAbsent = rec?.status === 'absent';

                return (
                  <div
                    key={day}
                    className={`h-7 w-7 mx-auto rounded-lg flex flex-col items-center justify-center ${
                      isPresent
                        ? 'bg-emerald-100 text-emerald-900 font-bold'
                        : isAbsent
                        ? 'bg-rose-100 text-rose-900 font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    <span>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Latest 3-4 Resources */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Latest Uploaded Deliverables</h3>
            <p className="text-xs text-slate-500">
              Review recent architecture reports, documents, and submit star feedback
            </p>
          </div>
          <button
            onClick={() => setActiveTab('resources')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            View & Rate All Resources &rarr;
          </button>
        </div>

        {batchResources.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
            No deliverables uploaded yet for this batch.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {batchResources.slice(0, 4).map((res) => (
              <div
                key={res.id}
                onClick={() => setActiveTab('resources')}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    {res.fileType}
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs mt-2 line-clamp-2">{res.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{res.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{res.uploaderName}</span>
                  <span>{res.uploadedAt.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CLIENT PAYMENT GATEWAY MODAL (UPI, Card, NetBanking, Direct Transfer)     */}
      {/* ========================================================================= */}
      {paymentModalOpen && activePayment && (
        <ClientPaymentGatewayModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          payment={activePayment}
          receivingCompany={receivingCompany}
          onPaymentComplete={(paymentId, details) => {
            markPaymentPaid(paymentId, details);
            setSuccessToast(
              `Payment of ${activePayment.currencySymbol}${activePayment.amount.toLocaleString()} completed and verified! Status updated to PAID across both Client & Company Admin portals.`
            );
          }}
        />
      )}
    </div>
  );
};
