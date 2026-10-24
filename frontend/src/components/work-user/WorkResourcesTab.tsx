import React from 'react';
import { ResourceItem } from '../../types';
import { Upload, Download, ExternalLink, FileText, Link as LinkIcon, Star, File } from 'lucide-react';

interface WorkResourcesTabProps {
  batchResources: ResourceItem[];
  onOpenUpload: () => void;
}

export const WorkResourcesTab: React.FC<WorkResourcesTabProps> = ({
  batchResources,
  onOpenUpload,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Uploaded Engineering Deliverables & Client Reviews
          </h2>
          <p className="text-xs text-slate-500">
            Upload architecture diagrams, code blueprints, audit reports, or external project links (Google Docs, Figma) and track client star ratings.
          </p>
        </div>
        <button
          onClick={onOpenUpload}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Deliverable</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {batchResources.map((res) => {
          const hasFile = res.fileUrl && res.fileUrl !== '#' && res.fileUrl.length > 1;
          const hasLink = !!res.externalLink && res.externalLink.trim().length > 0;

          return (
            <div
              key={res.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3.5 flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex justify-between items-start text-xs text-slate-500 gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px]">
                      {res.fileType}
                    </span>
                    {hasFile && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono border border-emerald-200 flex items-center space-x-0.5">
                        <File className="w-2.5 h-2.5" />
                        <span>File</span>
                      </span>
                    )}
                    {hasLink && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono border border-blue-200 flex items-center space-x-0.5">
                        <LinkIcon className="w-2.5 h-2.5" />
                        <span>Link</span>
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-slate-400 text-xs shrink-0">{res.fileSize}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-2">{res.title}</h3>
                {res.fileName && (
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center space-x-1">
                    <FileText className="w-3 h-3 shrink-0" />
                    <span className="truncate">{res.fileName}</span>
                  </p>
                )}
                {res.description && (
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{res.description}</p>
                )}

                {/* Direct Action Links / Downloads */}
                {(hasFile || hasLink) && (
                  <div className="flex flex-wrap items-center gap-2 pt-3">
                    {hasFile && (
                      <a
                        href={res.fileUrl}
                        download={res.fileName || `${res.title}.pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-600" />
                        <span>Download / View File</span>
                      </a>
                    )}
                    {hasLink && (
                      <a
                        href={res.externalLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Link</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>
                    Uploaded by: <b className="text-slate-800">{res.uploaderName}</b>
                  </span>
                  <span className="font-mono">{res.uploadedAt}</span>
                </div>

                {/* Client Reviews on this item */}
                {res.reviews && res.reviews.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Client Ratings & Feedback ({res.reviews.length}):
                    </span>
                    {res.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">{rev.reviewerName}</span>
                          <div className="flex text-amber-500 text-sm font-bold">
                            {'★'.repeat(rev.rating)}
                            {'☆'.repeat(5 - rev.rating)}
                          </div>
                        </div>
                        <p className="text-slate-700 text-[11px] mt-1 italic">
                          &ldquo;{rev.feedback}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {batchResources.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-2">
            <h4 className="font-bold text-slate-800 text-sm">No deliverables uploaded yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No files or reports have been shared for this batch yet. Click &quot;Upload Deliverable&quot; above to add your first document or external link.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
