import React, { useState } from 'react';
import { ClientCompany, ProjectMOU } from '../../../types';
import { FileSignature, X, Building2, Calendar, Coins, Sparkles } from 'lucide-react';

interface CreateProjectMouModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (mou: Omit<ProjectMOU, 'id'>, autoCreatePayment?: boolean) => void;
  clientCompanies: ClientCompany[];
  companyId: string;
  preselectedClientId?: string;
}

export const CreateProjectMouModal: React.FC<CreateProjectMouModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  clientCompanies,
  companyId,
  preselectedClientId,
}) => {
  const initialClient = clientCompanies.find((c) => c.id === preselectedClientId) || clientCompanies[0];
  const [selectedClientCompanyId, setSelectedClientCompanyId] = useState(initialClient?.id || '');
  const [projectTitle, setProjectTitle] = useState(
    initialClient ? `${initialClient.name} - Service Agreement & Retainer` : ''
  );
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(600000);
  const [monthlyAmount, setMonthlyAmount] = useState<number>(50000);
  const [currency, setCurrency] = useState('INR');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [billingFrequency, setBillingFrequency] = useState<'monthly' | 'quarterly' | 'milestone' | 'annual'>('monthly');
  const [billingDayOfMonth, setBillingDayOfMonth] = useState<number>(5);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<'draft' | 'active' | 'completed' | 'paused'>('active');
  const [mouTerms, setMouTerms] = useState(
    '1. Project Deliverables & SLA: Scope includes system deployment, monthly maintenance, and weekly synced reviews.\n2. Payment Terms: Invoices are raised on the 1st of each month and payable on or before the agreed billing day.\n3. Confidentiality & Non-Disclosure: Both parties agree to protect proprietary data and source materials.'
  );
  const [autoCreatePayment, setAutoCreatePayment] = useState(true);

  if (!isOpen) return null;

  const handleClientSelect = (clientId: string) => {
    setSelectedClientCompanyId(clientId);
    const selected = clientCompanies.find((c) => c.id === clientId);
    if (selected && !projectTitle) {
      setProjectTitle(`${selected.name} - Service Agreement & Retainer`);
    }
  };

  const selectedClient = clientCompanies.find((c) => c.id === selectedClientCompanyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    onAdd(
      {
        companyId,
        clientCompanyId: selectedClientCompanyId,
        clientName: selectedClient?.clientName || selectedClient?.name || 'Client Representative',
        clientEmail: selectedClient?.email || 'client@example.com',
        projectTitle,
        description,
        totalAmount: Number(totalAmount) || 0,
        monthlyAmount: Number(monthlyAmount) || 0,
        currency,
        currencySymbol,
        billingFrequency,
        billingDayOfMonth: Number(billingDayOfMonth) || 5,
        startDate,
        endDate,
        status,
        mouTerms,
        signedDate: status === 'active' ? new Date().toISOString().split('T')[0] : '',
      },
      autoCreatePayment
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Create Project Agreement & MOU
              </h3>
              <p className="text-xs text-slate-500">
                Define contract price, monthly retainer terms, and billing schedule
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Client Company / Organization *
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <select
                required
                value={selectedClientCompanyId}
                onChange={(e) => handleClientSelect(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              >
                <option value="">-- Select Client Organization --</option>
                {clientCompanies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.clientName} &bull; {c.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Project / Agreement Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Enterprise Cloud Logistics Automation & Maintenance Agreement"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Project Scope & Summary
            </label>
            <textarea
              rows={2}
              placeholder="Brief overview of project goals, technical deliverables, and agreed milestones..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
          </div>

          {/* Pricing & Retainer Grid */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 pb-1 border-b border-slate-200">
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>Agreed Price & Payment Structure</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Total Project Value (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step="1000"
                  value={totalAmount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTotalAmount(val);
                    if (!monthlyAmount || monthlyAmount === totalAmount / 12) {
                      setMonthlyAmount(Math.round(val / 12));
                    }
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 bg-white rounded-lg font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Monthly Recurring Payment (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step="500"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 bg-white rounded-lg font-bold text-blue-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Billing Day of Month *
                </label>
                <select
                  value={billingDayOfMonth}
                  onChange={(e) => setBillingDayOfMonth(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 bg-white rounded-lg font-medium"
                >
                  <option value={1}>1st of every month</option>
                  <option value={5}>5th of every month</option>
                  <option value={10}>10th of every month</option>
                  <option value={15}>15th of every month</option>
                  <option value={20}>20th of every month</option>
                  <option value={25}>25th of every month</option>
                  <option value={28}>28th of every month</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Agreement Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 bg-white rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Agreement End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 bg-white rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Contract Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 bg-white rounded-lg font-bold"
                >
                  <option value="active">Active Agreement</option>
                  <option value="draft">Draft Proposal</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>
          </div>

          {/* MOU Terms Clauses */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Memorandum of Understanding (MOU) Clauses & Agreement Terms
            </label>
            <textarea
              rows={4}
              value={mouTerms}
              onChange={(e) => setMouTerms(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Checkbox: Auto-create payment for current month */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="autoCreatePayment"
              checked={autoCreatePayment}
              onChange={(e) => setAutoCreatePayment(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="autoCreatePayment" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Automatically create current month ({new Date().toLocaleString('default', { month: 'short' })} {new Date().getFullYear()}) payment tracker record (Pending)
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2.5 border-t border-slate-100 pt-4">
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
              <Sparkles className="w-3.5 h-3.5" />
              <span>Approve & Create Project MOU</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
