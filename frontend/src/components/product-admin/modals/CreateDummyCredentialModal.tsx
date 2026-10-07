import React, { useState } from 'react';
import { DemoRequest } from '../../../types';

interface CreateDummyCredentialModalProps {
  demoRequest: DemoRequest;
  onClose: () => void;
  onSubmit: (requestId: string, password: string, days: number) => void;
}

export const CreateDummyCredentialModal: React.FC<CreateDummyCredentialModalProps> = ({
  demoRequest,
  onClose,
  onSubmit,
}) => {
  const [tempPasswordInput, setTempPasswordInput] = useState(
    `DemoPass#${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [tempDurationDays, setTempDurationDays] = useState(14);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Provision Temporary Dummy Credential
            </h3>
            <p className="text-xs text-slate-500">
              For {demoRequest.name} ({demoRequest.companyName})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            &times;
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Username (Email)
            </label>
            <input
              type="text"
              readOnly
              value={demoRequest.email}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-300 text-xs font-mono text-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Temporary Password
            </label>
            <input
              type="text"
              value={tempPasswordInput}
              onChange={(e) => setTempPasswordInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Validity Period
            </label>
            <select
              value={tempDurationDays}
              onChange={(e) => setTempDurationDays(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
            >
              <option value={7}>7 Days Trial</option>
              <option value={14}>14 Days Trial (Standard)</option>
              <option value={30}>30 Days Extended</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSubmit(demoRequest.id, tempPasswordInput, tempDurationDays);
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
          >
            Save & Activate Credential
          </button>
        </div>
      </div>
    </div>
  );
};
