import React from 'react';
import { ProjectMOU } from '../../../types';
import { FileSignature, X, Building2, Calendar, Coins, CheckCircle, Printer, Download } from 'lucide-react';

interface ViewMouModalProps {
  isOpen: boolean;
  onClose: () => void;
  mou: ProjectMOU | null;
}

export const ViewMouModal: React.FC<ViewMouModalProps> = ({ isOpen, onClose, mou }) => {
  if (!isOpen || !mou) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center font-bold">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">
                  Memorandum of Understanding (MOU)
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    mou.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {mou.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Reference ID: {mou.id} &bull; Signed: {mou.signedDate || mou.startDate || 'Pending'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Agreement</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Project Header Banner */}
        <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-300">
            Approved Client Project Contract
          </span>
          <h2 className="text-lg font-black tracking-tight text-white">{mou.projectTitle}</h2>
          <p className="text-xs text-slate-300 leading-relaxed">{mou.description}</p>
        </div>

        {/* Parties & Pricing Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="font-bold text-slate-900 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Client Entity & Counterparty</span>
            </div>
            <div className="space-y-1 text-slate-600">
              <p>
                <span className="font-semibold text-slate-700">Representative:</span>{' '}
                {mou.clientName}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Contact Email:</span>{' '}
                <span className="font-mono text-blue-600">{mou.clientEmail}</span>
              </p>
              <p>
                <span className="font-semibold text-slate-700">Effective Window:</span>{' '}
                {mou.startDate} to {mou.endDate || 'Ongoing'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-2">
            <div className="font-bold text-emerald-950 flex items-center space-x-2">
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>Commercial Terms & Retainer</span>
            </div>
            <div className="space-y-1 text-emerald-900">
              <p className="flex justify-between">
                <span className="text-emerald-700">Total Contract Value:</span>
                <span className="font-black text-sm text-emerald-950">
                  {mou.currencySymbol}{mou.totalAmount.toLocaleString()}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-emerald-700">Monthly Installment / Fee:</span>
                <span className="font-bold text-emerald-950">
                  {mou.currencySymbol}{mou.monthlyAmount.toLocaleString()} / mo
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-emerald-700">Payment Due Day:</span>
                <span className="font-semibold">
                  {mou.billingDayOfMonth}th of each month
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* MOU Clauses Text */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Terms of Understanding & Execution Clauses
          </h4>
          <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
            {mou.mouTerms || 'Standard service SLA agreement and NDA terms apply.'}
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-600">
          <div>
            <p className="font-semibold text-slate-900">For Managing Agency / Platform:</p>
            <div className="h-10 mt-2 border-b border-dashed border-slate-300 flex items-end font-mono text-[11px] text-blue-700 font-bold">
              Digitally Verified &bull; Active Admin
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Authorized Signatory</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">For Client Organization:</p>
            <div className="h-10 mt-2 border-b border-dashed border-slate-300 flex items-end font-mono text-[11px] text-slate-800 font-bold">
              {mou.clientName}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Client Authorized Officer</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close Agreement View
          </button>
        </div>
      </div>
    </div>
  );
};
