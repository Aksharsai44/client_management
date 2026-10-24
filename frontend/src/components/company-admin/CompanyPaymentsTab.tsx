import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProjectMOU, PaymentRecord, ClientCompany, Batch } from '../../types';
import {
  CreditCard,
  FileSignature,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Mail,
  Eye,
  FileText,
  Calendar,
  Building2,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Download,
  Send,
  Trash2,
  ShieldCheck,
  Layers,
  ChevronDown,
  Landmark,
} from 'lucide-react';
import { CreateProjectMouModal } from './modals/CreateProjectMouModal';
import { RecordPaymentModal } from './modals/RecordPaymentModal';
import { ViewMouModal } from './modals/ViewMouModal';
import { SendReminderModal } from './modals/SendReminderModal';
import { ManageReceivingAccountModal } from './modals/ManageReceivingAccountModal';

interface CompanyPaymentsTabProps {
  batchCompanies: ClientCompany[];
  currentBatch?: Batch;
  scopedBatches?: Batch[];
  activeBatchId?: string;
  setActiveBatchId?: (id: string) => void;
}

export const CompanyPaymentsTab: React.FC<CompanyPaymentsTabProps> = ({
  batchCompanies,
  currentBatch,
  scopedBatches,
  activeBatchId,
  setActiveBatchId,
}) => {
  const {
    currentUser,
    clientCompanies,
    batches,
    payments,
    projectMous,
    companyAdminMetrics,
    updateCompanyAdminMetric,
    addProjectMOU,
    deleteProjectMOU,
    markPaymentPaid,
    sendPaymentReminder,
    deletePayment,
  } = useApp();

  // Selected cohort batch ID
  const selectedBatchId = activeBatchId || currentBatch?.id || scopedBatches?.[0]?.id || 'batch_alpha';

  // Available batches for current organization
  const availableBatches = useMemo(() => {
    if (scopedBatches && scopedBatches.length > 0) return scopedBatches;
    if (batches && batches.length > 0) {
      if (currentUser?.companyId) {
        const filtered = batches.filter((b) => b.companyId === currentUser.companyId);
        if (filtered.length > 0) return filtered;
      }
      return batches;
    }
    return [];
  }, [scopedBatches, batches, currentUser]);

  const effectiveBatch = useMemo(() => {
    return (
      availableBatches.find((b) => b.id === selectedBatchId) ||
      currentBatch || {
        id: selectedBatchId,
        name: 'Active Cohort',
        code: 'BAT',
      }
    );
  }, [availableBatches, selectedBatchId, currentBatch]);

  // Current month string formatted as "YYYY-MM"
  const today = new Date();
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthLabel = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  // View state
  const [activeSubTab, setActiveSubTab] = useState<'monthly_tracker' | 'project_mous' | 'all_invoices'>('monthly_tracker');
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected client company inside active batch ('all' or a clientCompanyId)
  const [selectedClientCompanyId, setSelectedClientCompanyId] = useState<string>('all');

  // Modals state
  const [isCreateMouOpen, setIsCreateMouOpen] = useState(false);
  const [isBankSetupOpen, setIsBankSetupOpen] = useState(false);
  const [recordTargetPayment, setRecordTargetPayment] = useState<PaymentRecord | null>(null);
  const [viewingMou, setViewingMou] = useState<ProjectMOU | null>(null);
  const [reminderTargetPayment, setReminderTargetPayment] = useState<PaymentRecord | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Active Company Admin Profile for Bank & Receiving Account
  const currentAdminCompany = useMemo(() => {
    const targetId = currentUser?.companyId || 'comp_acme';
    return (
      companyAdminMetrics.find((c) => c.companyAdminId === targetId || c.id === targetId) ||
      companyAdminMetrics[0] ||
      null
    );
  }, [companyAdminMetrics, currentUser]);

  const showNotification = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  // Strictly identify client companies belonging to this batch & organization
  const cohortClients = useMemo(() => {
    const list = clientCompanies.filter((c) => {
      // 1. Organization boundary
      if (currentUser?.companyId && c.companyId && c.companyId !== currentUser.companyId) {
        return false;
      }
      // 2. Batch boundary
      if (c.batchId) {
        return c.batchId === selectedBatchId;
      }
      const primaryBatchId = scopedBatches?.[0]?.id || availableBatches[0]?.id || 'batch_alpha';
      return primaryBatchId === selectedBatchId;
    });

    if (list.length === 0 && batchCompanies && batchCompanies.length > 0) {
      return batchCompanies.filter((c) => !c.batchId || c.batchId === selectedBatchId);
    }
    return list;
  }, [clientCompanies, currentUser, selectedBatchId, scopedBatches, availableBatches, batchCompanies]);

  // Reset selectedClientCompanyId if active batch changes or selected client is no longer in cohortClients
  useEffect(() => {
    if (selectedClientCompanyId !== 'all') {
      const stillInCohort = cohortClients.some((c) => c.id === selectedClientCompanyId);
      if (!stillInCohort) {
        setSelectedClientCompanyId('all');
      }
    }
  }, [selectedBatchId, cohortClients, selectedClientCompanyId]);

  // Specific client object if a single client is selected
  const activeSelectedClient = useMemo(() => {
    if (selectedClientCompanyId === 'all') return null;
    return cohortClients.find((c) => c.id === selectedClientCompanyId) || null;
  }, [cohortClients, selectedClientCompanyId]);

  // Map of client identifier -> batchId to resolve which batch ANY record belongs to
  const clientIdentifierToBatchMap = useMemo(() => {
    const map = new Map<string, string>();
    clientCompanies.forEach((c) => {
      const bId = c.batchId || (availableBatches[0]?.id || 'batch_alpha');
      if (c.id) map.set(c.id, bId);
      if (c.email) map.set(c.email.toLowerCase(), bId);
      if (c.name) map.set(c.name.toLowerCase(), bId);
      if (c.clientName) map.set(c.clientName.toLowerCase(), bId);
    });
    return map;
  }, [clientCompanies, availableBatches]);

  const resolveRecordBatchId = useMemo(() => {
    return (record: { clientCompanyId?: string; clientEmail?: string; clientName?: string }) => {
      if (record.clientCompanyId && clientIdentifierToBatchMap.has(record.clientCompanyId)) {
        return clientIdentifierToBatchMap.get(record.clientCompanyId);
      }
      if (record.clientEmail && clientIdentifierToBatchMap.has(record.clientEmail.toLowerCase())) {
        return clientIdentifierToBatchMap.get(record.clientEmail.toLowerCase());
      }
      if (record.clientName && clientIdentifierToBatchMap.has(record.clientName.toLowerCase())) {
        return clientIdentifierToBatchMap.get(record.clientName.toLowerCase());
      }
      return null;
    };
  }, [clientIdentifierToBatchMap]);

  // Match helper to strictly scope transactions to active batch / client group
  const isRecordInActiveScope = useMemo(() => {
    return (record: { clientCompanyId?: string; clientEmail?: string; clientName?: string; companyId?: string }) => {
      // 1. Organization boundary: Must match currentUser.companyId if set
      if (currentUser?.companyId && record.companyId && record.companyId !== currentUser.companyId) {
        return false;
      }

      // 2. Batch boundary: Must belong strictly to selectedBatchId
      const recordBatchId = resolveRecordBatchId(record);
      if (recordBatchId !== selectedBatchId) {
        return false;
      }

      // 3. Client Group boundary: If a specific client is selected, match that client ONLY
      if (activeSelectedClient) {
        if (record.clientCompanyId && record.clientCompanyId === activeSelectedClient.id) return true;
        if (record.clientEmail && record.clientEmail.toLowerCase() === activeSelectedClient.email.toLowerCase()) return true;
        if (
          record.clientName &&
          (record.clientName.toLowerCase() === activeSelectedClient.clientName.toLowerCase() ||
            record.clientName.toLowerCase() === activeSelectedClient.name.toLowerCase())
        ) {
          return true;
        }
        return false;
      }

      // 4. If 'all', any record in this batch is allowed
      return true;
    };
  }, [currentUser, selectedBatchId, activeSelectedClient, resolveRecordBatchId]);

  // Scoped to current company AND active cohort/client selection
  const scopedMous = useMemo(() => {
    return projectMous.filter((m) => isRecordInActiveScope(m));
  }, [projectMous, isRecordInActiveScope]);

  const scopedPayments = useMemo(() => {
    return payments.filter((p) => isRecordInActiveScope(p));
  }, [payments, isRecordInActiveScope]);

  // Current month specific metrics
  const currentMonthPayments = useMemo(() => {
    return scopedPayments.filter((p) => p.billingMonth === selectedMonth);
  }, [scopedPayments, selectedMonth]);

  const currentMonthStats = useMemo(() => {
    const paidList = currentMonthPayments.filter((p) => p.status === 'paid');
    const pendingList = currentMonthPayments.filter((p) => p.status === 'pending');
    const overdueList = currentMonthPayments.filter((p) => p.status === 'overdue');

    const totalExpected = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalCollected = paidList.reduce((sum, p) => sum + p.amount, 0);
    const totalPending = pendingList.reduce((sum, p) => sum + p.amount, 0);
    const totalOverdue = overdueList.reduce((sum, p) => sum + p.amount, 0);

    const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

    return {
      paidCount: paidList.length,
      pendingCount: pendingList.length,
      overdueCount: overdueList.length,
      totalExpected,
      totalCollected,
      totalPending,
      totalOverdue,
      collectionRate,
    };
  }, [currentMonthPayments]);

  // Filtered payments list
  const filteredPayments = useMemo(() => {
    return scopedPayments.filter((p) => {
      const matchesMonth =
        activeSubTab === 'monthly_tracker'
          ? selectedMonth === 'all'
            ? true
            : p.billingMonth === selectedMonth
          : true;

      const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;

      const query = searchTerm.toLowerCase();
      const matchesSearch =
        p.clientName?.toLowerCase().includes(query) ||
        p.title?.toLowerCase().includes(query) ||
        p.invoiceNumber?.toLowerCase().includes(query) ||
        p.transactionReference?.toLowerCase().includes(query);

      return matchesMonth && matchesStatus && matchesSearch;
    });
  }, [scopedPayments, activeSubTab, selectedMonth, statusFilter, searchTerm]);

  // Available client companies for MOUs modal
  const effectiveClientCompanies = useMemo(() => {
    if (activeSelectedClient) {
      return [activeSelectedClient];
    }
    return cohortClients.length > 0 ? cohortClients : [];
  }, [activeSelectedClient, cohortClients]);

  // Billing cycle options built from real data (always includes current month)
  const monthOptions = useMemo(() => {
    const set = new Set<string>([currentMonthKey]);
    scopedPayments.forEach((p) => p.billingMonth && set.add(p.billingMonth));
    return Array.from(set).sort().reverse();
  }, [scopedPayments, currentMonthKey]);

  const formatMonth = (key: string) => {
    const [y, m] = key.split('-').map(Number);
    if (!y || !m) return key;
    return new Date(y, m - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const statusBadge = (status: PaymentRecord['status']) => {
    if (status === 'paid') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5" /> Paid
        </span>
      );
    }
    if (status === 'overdue') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
          <AlertTriangle className="w-3.5 h-3.5" /> Overdue
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
        <Clock className="w-3.5 h-3.5" /> Pending
      </span>
    );
  };

  const statusCounts = {
    all: scopedPayments.length,
    paid: scopedPayments.filter((p) => p.status === 'paid').length,
    pending: scopedPayments.filter((p) => p.status === 'pending').length,
    overdue: scopedPayments.filter((p) => p.status === 'overdue').length,
  };

  const kpis = [
    {
      label: `Collected · ${selectedMonth === 'all' ? 'All months' : formatMonth(selectedMonth)}`,
      value: `₹${currentMonthStats.totalCollected.toLocaleString()}`,
      sub: `${currentMonthStats.paidCount} paid`,
      icon: CheckCircle2,
      tone: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Pending',
      value: `₹${currentMonthStats.totalPending.toLocaleString()}`,
      sub: `${currentMonthStats.pendingCount} awaiting`,
      icon: Clock,
      tone: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      label: 'Overdue',
      value: `₹${currentMonthStats.totalOverdue.toLocaleString()}`,
      sub: `${currentMonthStats.overdueCount} past due`,
      icon: AlertTriangle,
      tone: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    {
      label: 'Contracts (MOUs)',
      value: `${scopedMous.length}`,
      sub: `Total ₹${scopedMous.reduce((acc, m) => acc + m.totalAmount, 0).toLocaleString()}`,
      icon: FileSignature,
      tone: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
  ];

  const subTabs: { id: 'monthly_tracker' | 'project_mous' | 'all_invoices'; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'monthly_tracker', label: 'Monthly Tracker', icon: CheckCircle2, count: currentMonthStats.pendingCount + currentMonthStats.overdueCount },
    { id: 'project_mous', label: 'Contracts / MOUs', icon: FileSignature, count: scopedMous.length },
    { id: 'all_invoices', label: 'All Invoices', icon: Receipt, count: scopedPayments.length },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Toast */}
      {actionSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800 text-base leading-none">
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <CreditCard className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">Payments &amp; Contracts</h1>
            <p className="text-xs text-slate-500">See who has paid, who is pending, and manage client agreements.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBankSetupOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Landmark className="w-4 h-4 text-emerald-600" />
            <span>Bank &amp; UPI</span>
          </button>
          <button
            onClick={() => setIsCreateMouOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New MOU</span>
          </button>
        </div>
      </div>

      {/* Scope filters (one compact row) */}
      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        {availableBatches.length > 1 && (
          <label className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-500">Cohort</span>
            <select
              value={selectedBatchId}
              onChange={(e) => {
                setActiveBatchId && setActiveBatchId(e.target.value);
                setSelectedClientCompanyId('all');
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              {availableBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {availableBatches.length <= 1 && (
          <div className="flex items-center gap-2 text-xs">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-500">Cohort</span>
            <span className="font-black text-slate-900">{effectiveBatch?.name || 'Primary Cohort'}</span>
          </div>
        )}

        <label className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-500">Client</span>
          <select
            value={selectedClientCompanyId}
            onChange={(e) => setSelectedClientCompanyId(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer max-w-[260px]"
          >
            <option value="all">All clients ({cohortClients.length})</option>
            {cohortClients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.clientName})
              </option>
            ))}
          </select>
        </label>

        {selectedClientCompanyId !== 'all' && (
          <button
            onClick={() => setSelectedClientCompanyId('all')}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            &times; Clear
          </button>
        )}

        <div className="ml-auto text-[11px] text-slate-500 font-medium">
          {scopedMous.length} agreement(s) &bull; {scopedPayments.length} payment(s)
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${k.tone}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-slate-500 truncate">{k.label}</div>
                <div className="text-lg font-black text-slate-900 leading-tight">{k.value}</div>
                <div className="text-[11px] text-slate-500">{k.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs + month */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
        <div className="flex items-center gap-1">
          {subTabs.map((t) => {
            const Icon = t.icon;
            const active = activeSubTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveSubTab(t.id)}
                className={`relative px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors border-b-2 -mb-px ${
                  active ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
                {t.count !== undefined && t.count > 0 && (
                  <span
                    className={`px-1.5 rounded-full text-[10px] font-black ${
                      active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeSubTab === 'monthly_tracker' && (
          <label className="flex items-center gap-2 text-xs pb-2">
            <span className="font-bold text-slate-500">Billing month</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  {formatMonth(m)}
                  {m === currentMonthKey ? ' (Current)' : ''}
                </option>
              ))}
              <option value="all">All months</option>
            </select>
          </label>
        )}
      </div>

      {/* Status filter + search (invoice views only) */}
      {activeSubTab !== 'project_mous' && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {([
              ['all', 'All', 'bg-slate-900 text-white'],
              ['paid', 'Paid', 'bg-emerald-600 text-white'],
              ['pending', 'Pending', 'bg-amber-500 text-white'],
              ['overdue', 'Overdue', 'bg-rose-600 text-white'],
            ] as const).map(([key, label, activeCls]) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === key
                    ? activeCls
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {label} <span className="opacity-70">({statusCounts[key]})</span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search client, invoice or UTR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
            />
          </div>
        </div>
      )}

      {/* ===================== MONTHLY TRACKER ===================== */}
      {activeSubTab === 'monthly_tracker' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm">
              {selectedMonth === 'all' ? 'All billing months' : formatMonth(selectedMonth)}
            </h3>
            <span className="text-xs text-slate-500">
              <b className="text-slate-800">{filteredPayments.length}</b> record(s)
            </span>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <CreditCard className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">No payments match these filters.</p>
              <button
                onClick={() => setIsCreateMouOpen(true)}
                className="px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                + Create Project MOU
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[820px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-3 px-5 w-[26%]">Client</th>
                    <th className="py-3 px-4 w-[26%]">Invoice</th>
                    <th className="py-3 px-4 w-[12%]">Due date</th>
                    <th className="py-3 px-4 w-[12%] text-right">Amount</th>
                    <th className="py-3 px-4 w-[14%]">Status</th>
                    <th className="py-3 px-5 w-[10%] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((p) => {
                    const isPaid = p.status === 'paid';
                    return (
                      <tr key={p.id} className={`hover:bg-slate-50/70 transition-colors ${p.status === 'overdue' ? 'bg-rose-50/30' : ''}`}>
                        <td className="py-3.5 px-5 align-top">
                          <div className="font-bold text-slate-900 truncate">{p.clientName}</div>
                          <div className="text-[11px] text-slate-500 truncate">{p.clientEmail}</div>
                        </td>
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-semibold text-slate-800 truncate" title={p.title}>
                            {p.title}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {p.invoiceNumber} &bull; {p.billingMonth}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <div className="font-mono text-slate-700">{p.dueDate || 'N/A'}</div>
                          {p.status === 'overdue' && <div className="text-[10px] font-bold text-rose-600 mt-0.5">Past due</div>}
                        </td>
                        <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                          <span className="text-sm font-black text-slate-900">
                            {p.currencySymbol}
                            {p.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 align-top">
                          {statusBadge(p.status)}
                          <div className="text-[10px] text-slate-500 mt-1 leading-snug">
                            {isPaid
                              ? `${p.transactionReference || 'Cleared'} · ${p.paidDate}`
                              : p.reminderSent
                              ? `Reminder sent ${p.reminderSentAt || ''}`
                              : 'Awaiting payment'}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 align-top">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isPaid ? (
                              <>
                                <button
                                  onClick={() => setRecordTargetPayment(p)}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                                  title="Mark as paid"
                                >
                                  Mark paid
                                </button>
                                <button
                                  onClick={() => setReminderTargetPayment(p)}
                                  className="p-1.5 border border-slate-200 hover:bg-blue-50 text-blue-700 rounded-lg transition-colors cursor-pointer"
                                  title="Send reminder email"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setRecordTargetPayment(p)}
                                className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Receipt className="w-3.5 h-3.5 text-slate-500" />
                                <span>Receipt</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUB TAB: PROJECT MOUS & CONTRACTS                                     */}
      {/* ========================================================================= */}
      {activeSubTab === 'project_mous' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Executed Client Project MOUs & Commercial Agreements ({scopedMous.length})
            </h3>
            <button
              onClick={() => setIsCreateMouOpen(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Project Agreement</span>
            </button>
          </div>

          {scopedMous.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
              <FileSignature className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No Project MOUs created yet.</p>
              <button
                onClick={() => setIsCreateMouOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Create First MOU
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scopedMous.map((m) => {
                const clientPayments = scopedPayments.filter((p) => p.projectMouId === m.id);
                const paidSum = clientPayments
                  .filter((p) => p.status === 'paid')
                  .reduce((acc, p) => acc + p.amount, 0);

                return (
                  <div
                    key={m.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 hover:border-blue-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{m.projectTitle}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                m.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {m.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 font-medium flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{m.clientName}</span>
                            <span>&bull;</span>
                            <span className="font-mono text-blue-600">{m.clientEmail}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-black text-slate-900">
                            {m.currencySymbol}{m.totalAmount.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-500 font-bold">
                            Total Agreement
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {m.description || 'Custom service level agreement with monthly milestone retainers.'}
                      </p>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Monthly Fee</div>
                          <div className="font-extrabold text-blue-700">
                            {m.currencySymbol}{m.monthlyAmount.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Billing Day</div>
                          <div className="font-bold text-slate-800">
                            {m.billingDayOfMonth}th of month
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Duration</div>
                          <div className="font-medium text-slate-700 truncate" title={`${m.startDate} - ${m.endDate}`}>
                            {m.startDate || 'Immediate'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-[11px] text-slate-500 font-medium">
                        Collected: <strong className="text-emerald-700">{m.currencySymbol}{paidSum.toLocaleString()}</strong>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setViewingMou(m)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>View MOU Terms</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete project MOU "${m.projectTitle}"?`)) {
                              deleteProjectMOU(m.id);
                              showNotification('Project MOU deleted.');
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUB TAB: ALL INVOICES & AUDIT LEDGER                                   */}
      {/* ========================================================================= */}
      {activeSubTab === 'all_invoices' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Master Accounts Ledger & Invoice Repository
              </h3>
              <p className="text-xs text-slate-500">
                All generated billing invoices and settlement receipts across historical cycles
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Cycle Month</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Settlement Details</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.invoiceNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{p.clientName}</div>
                      <div className="text-[11px] text-slate-400">{p.clientEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{p.billingMonth}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{p.dueDate}</td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      {p.currencySymbol}{p.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          p.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : p.status === 'overdue'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-600">
                      {p.status === 'paid' ? (
                        <div>
                          <span className="font-mono font-bold text-slate-800">{p.transactionReference}</span>
                          <span className="text-slate-400 block text-[10px]">{p.paymentMethod}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unsettled</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.status !== 'paid' ? (
                        <button
                          onClick={() => setRecordTargetPayment(p)}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                        >
                          Mark Paid
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold text-[11px]">Settled &bull; Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS                                                                    */}
      {/* ========================================================================= */}
      <CreateProjectMouModal
        isOpen={isCreateMouOpen}
        onClose={() => setIsCreateMouOpen(false)}
        clientCompanies={effectiveClientCompanies}
        companyId={currentUser?.companyId || 'comp_acme'}
        preselectedClientId={activeSelectedClient?.id}
        onAdd={(mouData, autoCreatePayment) => {
          addProjectMOU(mouData, autoCreatePayment);
          showNotification('Project Agreement & MOU created successfully. Payment schedules generated.');
        }}
      />

      {recordTargetPayment && (
        <RecordPaymentModal
          isOpen={!!recordTargetPayment}
          onClose={() => setRecordTargetPayment(null)}
          payment={recordTargetPayment}
          onRecord={(paymentId, details) => {
            markPaymentPaid(paymentId, details);
            showNotification(`Payment recorded successfully with reference ${details.transactionReference}.`);
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

      {reminderTargetPayment && (
        <SendReminderModal
          isOpen={!!reminderTargetPayment}
          onClose={() => setReminderTargetPayment(null)}
          payment={reminderTargetPayment}
          onSend={async (paymentId) => {
            const res = await sendPaymentReminder(paymentId);
            showNotification(res.message);
            return res;
          }}
        />
      )}

      {/* Admin Bank & UPI Configuration Modal */}
      <ManageReceivingAccountModal
        isOpen={isBankSetupOpen}
        onClose={() => setIsBankSetupOpen(false)}
        currentCompany={currentAdminCompany}
        onSave={async (updated) => {
          await updateCompanyAdminMetric(updated);
          showNotification('Receiving bank account & UPI details saved successfully. Client payments will route directly to this account.');
        }}
      />
    </div>
  );
};
