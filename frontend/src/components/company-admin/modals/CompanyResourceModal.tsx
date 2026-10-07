import React, { useState } from 'react';

interface CompanyResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (title: string, desc: string, fileType: string, fileSize: string) => void;
}

export const CompanyResourceModal: React.FC<CompanyResourceModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [resourceForm, setResourceForm] = useState({
    title: '',
    description: '',
    fileType: 'PDF Document',
    fileSize: '3.4 MB',
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm">Upload Deliverable or Report</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            &times;
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onUpload(
              resourceForm.title,
              resourceForm.description,
              resourceForm.fileType,
              resourceForm.fileSize
            );
            onClose();
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Document Title</label>
            <input
              type="text"
              required
              value={resourceForm.title}
              onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
              placeholder="e.g. Q4 Performance Audit Report"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={resourceForm.description}
              onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
              placeholder="Summary of contents..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
              <select
                value={resourceForm.fileType}
                onChange={(e) => setResourceForm({ ...resourceForm, fileType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
              >
                <option value="PDF Document">PDF Document</option>
                <option value="PowerPoint PPTX">PowerPoint PPTX</option>
                <option value="Spreadsheet CSV">Spreadsheet CSV</option>
                <option value="ZIP Archive">ZIP Archive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Size</label>
              <input
                type="text"
                value={resourceForm.fileSize}
                onChange={(e) => setResourceForm({ ...resourceForm, fileSize: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
