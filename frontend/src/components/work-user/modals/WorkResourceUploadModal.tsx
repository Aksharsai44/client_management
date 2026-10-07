import React, { useState } from 'react';

interface WorkResourceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (title: string, desc: string, fileType: string, fileSize: string) => void;
}

export const WorkResourceUploadModal: React.FC<WorkResourceUploadModalProps> = ({
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
          <h3 className="font-bold text-slate-900 text-sm">Upload Engineering Deliverable</h3>
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
              placeholder="e.g. Migration Blueprint v1.0"
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
              <option value="Architecture Diagram">Architecture Diagram</option>
              <option value="Code Repository ZIP">Code Repository ZIP</option>
              <option value="Spreadsheet / Spec">Spreadsheet / Spec</option>
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
              onUpload(resTitle.trim(), resDesc.trim(), resType, '5.2 MB');
              onClose();
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};
