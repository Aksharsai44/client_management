import React, { useState } from 'react';

interface ClientResourceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (title: string, desc: string, fileType: string, fileSize: string) => void;
}

export const ClientResourceUploadModal: React.FC<ClientResourceUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [resTitle, setResTitle] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resType, setResType] = useState('PDF Document');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm">Upload Deliverable Document</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            &times;
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={resTitle}
              onChange={(e) => setResTitle(e.target.value)}
              placeholder="e.g. Client Feedback Notes"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={resDesc}
              onChange={(e) => setResDesc(e.target.value)}
              placeholder="Summary..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">File Type</label>
            <select
              value={resType}
              onChange={(e) => setResType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
            >
              <option value="PDF Document">PDF Document</option>
              <option value="Client Notes">Client Notes</option>
              <option value="Requirement Doc">Requirement Doc</option>
              <option value="Spreadsheet CSV">Spreadsheet CSV</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!resTitle.trim()) return;
              onUpload(resTitle.trim(), resDesc.trim(), resType, '2.1 MB');
              onClose();
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};
