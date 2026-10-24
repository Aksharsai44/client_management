import React, { useState, useRef } from 'react';
import { Upload, FileText, Link as LinkIcon, X, Check, File, ExternalLink, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { resourceApi } from '../../services/resourceApi';

export interface DeliverableUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (
    title: string,
    desc: string,
    fileType: string,
    fileSize: string,
    fileUrl?: string,
    fileName?: string,
    externalLink?: string
  ) => void;
  modalTitle?: string;
  themeColor?: 'amber' | 'blue' | 'emerald';
  submitButtonText?: string;
}

export const DeliverableUploadModal: React.FC<DeliverableUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  modalTitle = 'Upload Engineering Deliverable',
  themeColor = 'amber',
  submitButtonText = 'Upload Deliverable',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState('PDF Document');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [externalLink, setExternalLink] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Determine accent classes
  const colorStyles = {
    amber: {
      btn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20',
      activeTab: 'bg-amber-50 text-amber-700 border-amber-300',
      ring: 'focus:border-amber-500 focus:ring-amber-500/20',
      badge: 'bg-amber-100 text-amber-800',
      borderDrag: 'border-amber-500 bg-amber-50/50',
    },
    blue: {
      btn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20',
      activeTab: 'bg-blue-50 text-blue-700 border-blue-300',
      ring: 'focus:border-blue-500 focus:ring-blue-500/20',
      badge: 'bg-blue-100 text-blue-800',
      borderDrag: 'border-blue-500 bg-blue-50/50',
    },
    emerald: {
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
      activeTab: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      ring: 'focus:border-emerald-500 focus:ring-emerald-500/20',
      badge: 'bg-emerald-100 text-emerald-800',
      borderDrag: 'border-emerald-500 bg-emerald-50/50',
    },
  }[themeColor];

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  };

  const detectFileType = (file: File): string => {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (ext === '.pdf') return 'PDF Document';
    if (['.doc', '.docx'].includes(ext)) return 'Word Document';
    if (['.xls', '.xlsx', '.csv'].includes(ext)) return 'Spreadsheet / Spec';
    if (['.ppt', '.pptx'].includes(ext)) return 'PowerPoint Presentation';
    if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(ext)) return 'Code Repository ZIP';
    if (['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif'].includes(ext)) return 'Architecture Diagram / Image';
    if (['.txt', '.md', '.json', '.yaml'].includes(ext)) return 'Text / Specification';
    if (['.mp4', '.mov', '.webm'].includes(ext)) return 'Video Walkthrough';
    return 'Deliverable Document';
  };

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    setErrorMessage('');

    // Auto-fill title if empty
    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Auto-detect file type
    const detected = detectFileType(file);
    setFileType(detected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleLinkPreset = (presetUrl: string, placeholderTitle: string) => {
    setExternalLink(presetUrl);
    if (!title.trim()) {
      setTitle(placeholderTitle);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please provide a document title.');
      return;
    }

    if (!selectedFile && !externalLink.trim()) {
      setErrorMessage('Please either choose a file (PDF, Doc, etc.) or provide an external link.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    let fileUrl = '#';
    let fileName = '';
    let fileSize = '1.0 MB';
    let computedFileType = fileType;

    try {
      if (selectedFile) {
        fileName = selectedFile.name;
        fileSize = formatFileSize(selectedFile.size);
        computedFileType = detectFileType(selectedFile);

        try {
          // Upload actual file to PostgreSQL backed Django API
          const uploadRes = await resourceApi.uploadFile(selectedFile);
          if (uploadRes && uploadRes.fileUrl) {
            fileUrl = uploadRes.fileUrl;
            fileName = uploadRes.fileName || fileName;
            fileSize = uploadRes.fileSize || fileSize;
            computedFileType = uploadRes.fileType || computedFileType;
          }
        } catch (uploadErr) {
          console.warn('Backend file upload fallback to base64 dataUrl:', uploadErr);
          // Fallback to reading as dataUrl so link always opens/works even in offline mode
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(selectedFile);
          });
          fileUrl = dataUrl;
        }
      } else if (externalLink.trim()) {
        fileSize = 'External Link';
        if (fileType === 'PDF Document') {
          computedFileType = 'External Web Link';
        }
      }

      // Invoke parent handler to save to backend & trigger real-time broadcasts
      onUpload(
        title.trim(),
        description.trim(),
        computedFileType,
        fileSize,
        fileUrl,
        fileName,
        externalLink.trim()
      );

      // Reset and close
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setExternalLink('');
      setIsUploading(false);
      onClose();
    } catch (err: any) {
      console.error('Failed to upload deliverable:', err);
      setErrorMessage(err?.message || 'Failed to complete deliverable upload. Please retry.');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorStyles.badge}`}>
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{modalTitle}</h3>
              <p className="text-[11px] text-slate-500">
                Upload files (PDF, Word, Excel, ZIP) or share external web links (Google Docs, Figma).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Document Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Deliverable Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Migration Blueprint v1.0 or API Documentation"
              className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all ${colorStyles.ring}`}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Summary</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a concise summary of the contents, version changes, or instructions..."
              className={`w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all ${colorStyles.ring}`}
            />
          </div>

          {/* 1. FILE SELECTION (PDF, DOCS, ANY FILE) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-700">
                Attachment File <span className="text-[11px] font-normal text-slate-500">(PDF, DOC, XLS, ZIP, Images, etc.)</span>
              </label>
              {selectedFile && (
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-[11px] text-red-600 hover:underline flex items-center space-x-0.5"
                >
                  <X className="w-3 h-3" />
                  <span>Remove file</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.zip,.rar,.7z,.png,.jpg,.jpeg,.svg,.webp,*"
            />

            {!selectedFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all hover:border-slate-400 hover:bg-slate-50/70 ${
                  isDragOver ? colorStyles.borderDrag : 'border-slate-300 bg-slate-50/40'
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-1.5">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      Click to choose file <span className="font-normal text-slate-500">or drag & drop</span>
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Supports PDF, Word (DOCX), Excel, PowerPoint, ZIP archives, Images up to 50MB
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <File className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 truncate">{selectedFile.name}</p>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                      <span>{formatFileSize(selectedFile.size)}</span>
                      <span>•</span>
                      <span className="font-medium text-slate-700">{detectFileType(selectedFile)}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* 2. EXTERNAL WEB LINK INPUT */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-slate-700">
              External Link / URL <span className="text-[11px] font-normal text-slate-500">(Google Docs, Figma, GitHub, Notion, Drive)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <LinkIcon className="w-3.5 h-3.5" />
              </div>
              <input
                type="url"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                placeholder="https://docs.google.com/document/... or Figma, GitHub, Notion"
                className={`w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all ${colorStyles.ring}`}
              />
              {externalLink && (
                <button
                  type="button"
                  onClick={() => setExternalLink('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick helper chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Quick Link:</span>
              <button
                type="button"
                onClick={() => handleLinkPreset('https://docs.google.com/document/d/', 'Google Docs Specification')}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium transition-colors"
              >
                + Google Docs
              </button>
              <button
                type="button"
                onClick={() => handleLinkPreset('https://figma.com/file/', 'Figma Interactive Mockup')}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium transition-colors"
              >
                + Figma
              </button>
              <button
                type="button"
                onClick={() => handleLinkPreset('https://github.com/', 'GitHub Repository & Release')}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium transition-colors"
              >
                + GitHub
              </button>
              <button
                type="button"
                onClick={() => handleLinkPreset('https://drive.google.com/drive/folders/', 'Google Drive Vault')}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium transition-colors"
              >
                + Drive Folder
              </button>
            </div>
          </div>

          {/* File Type Dropdown */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deliverable Category</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 outline-none"
              >
                <option value="PDF Document">PDF Document</option>
                <option value="Word Document">Word Document</option>
                <option value="Spreadsheet / Spec">Spreadsheet / Spec</option>
                <option value="PowerPoint Presentation">PowerPoint Presentation</option>
                <option value="Architecture Diagram / Image">Architecture Diagram / Image</option>
                <option value="Code Repository ZIP">Code Repository ZIP</option>
                <option value="External Web Link">External Web Link</option>
                <option value="Audit & Security Report">Audit & Security Report</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Batch</label>
              <div className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>Active Project Cohort</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 font-mono text-slate-700">Realtime</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isUploading}
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || (!selectedFile && !externalLink.trim())}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${colorStyles.btn}`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading to Cloud...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>{submitButtonText}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
