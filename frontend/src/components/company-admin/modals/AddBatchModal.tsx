import React, { useState } from 'react';
import { X, Layers, Calendar, Sparkles, Check, AlertCircle, RefreshCw, FileText, Hash } from 'lucide-react';
import { Batch, User } from '../../../types';
import { useApp } from '../../../context/AppContext';

interface AddBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User;
  onBatchCreated?: (newBatch: Batch) => void;
}

export const AddBatchModal: React.FC<AddBatchModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onBatchCreated,
}) => {
  const { addBatch } = useApp();

  const [name, setName] = useState('');
  const [code, setCode] = useState(() => `BAT-${new Date().getFullYear()}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`);
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Batch name is required.');
      return;
    }
    if (!code.trim()) {
      setErrorMessage('Batch code is required.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const companyId = currentUser?.companyId || (currentUser?.role === 'company_admin' ? currentUser.id : 'comp_acme');
      const newBatchData: Omit<Batch, 'id'> = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim() || 'Custom managed workspace cohort.',
        startDate: startDate || new Date().toISOString().split('T')[0],
        status: 'active',
        companyId: companyId,
        leadAdminId: currentUser?.id || '',
        clientCount: 0,
        workerCount: 0,
      };

      const created = await addBatch(newBatchData);
      if (onBatchCreated && created) {
        onBatchCreated(created);
      }
      onClose();
    } catch (err) {
      console.error('Failed to create batch:', err);
      setErrorMessage('Failed to create cohort batch. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header Banner */}
        <div className="p-6 bg-linear-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Create Workspace Batch</h3>
              <p className="text-xs text-indigo-100 mt-0.5">
                Initialize a dedicated real-time cohort for clients and team members
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Batch Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Batch / Cohort Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Batch Delta - Global Fintech Migration"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              required
              autoFocus
            />
          </div>

          {/* Batch Code & Start Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-600" />
                Cohort Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. BAT-2026-D"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden uppercase"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                Target Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Cohort Description & Scope
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the client deliverables, sprint cadence, or program objectives for this batch..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
            />
          </div>

          {/* Real-time sync note */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between text-[11px] text-indigo-900">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="font-medium">Direct real-time sync with PostgreSQL database</span>
            </div>
            <span className="font-bold text-[10px] uppercase text-indigo-600 bg-indigo-100/80 px-2 py-0.5 rounded-md">
              Live Active
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center space-x-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating Cohort...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Create Batch</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
