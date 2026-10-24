import React from 'react';
import { ResourceItem } from '../../types';
import { Upload, Download, ExternalLink, FileText, Link as LinkIcon, File } from 'lucide-react';

interface CompanyResourcesTabProps {
  batchResources: ResourceItem[];
  onOpenUploadModal: () => void;
}

export const CompanyResourcesTab: React.FC<CompanyResourcesTabProps> = ({
  batchResources,
  onOpenUploadModal,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Resources, Deliverables & Reports
          </h2>
          <p className="text-xs text-slate-500">
            All engineering artifacts, reports, and links shared across your client cohorts with live download links and client star reviews.
          </p>
        </div>
        <button
          onClick={onOpenUploadModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New Resource</span>
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
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
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
                  <span className="text-xs text-slate-400 font-mono shrink-0">{res.fileSize}</span>
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

              {/* Uploader & Upload Time */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div>
                    <span>Uploaded by: </span>
                    <span className="font-bold text-slate-800">{res.uploaderName}</span>
                    <span className="text-[10px] text-slate-400 ml-1">
                      ({res.uploaderRole.replace('_', ' ')})
                    </span>
                  </div>
                  <span className="text-[11px] font-mono">{res.uploadedAt}</span>
                </div>

                {/* Reviews on this resource */}
                {res.reviews && res.reviews.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Client Ratings & Reviews ({res.reviews.length}):
                    </span>
                    {res.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-2 rounded-lg bg-amber-50/60 border border-amber-200 text-xs"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800">{rev.reviewerName}</span>
                          <div className="flex text-amber-500">
                            {Array.from({ length: 5 }, (_, i) => (
                              <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5">{rev.feedback}</p>
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
            <h4 className="font-bold text-slate-800 text-sm">No resources uploaded yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No files or links have been added for this cohort yet. Click &quot;Upload New Resource&quot; to share deliverables.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
