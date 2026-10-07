import React from 'react';
import { ResourceItem } from '../../types';
import { Upload } from 'lucide-react';

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
            All resources and reports uploaded by clients and workers with upload time, file sizes, and client star reviews.
          </p>
        </div>
        <button
          onClick={onOpenUploadModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New Resource</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {batchResources.map((res) => (
          <div
            key={res.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {res.fileType}
                </span>
                <span className="text-xs text-slate-400 font-medium">{res.fileSize}</span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm mt-2">{res.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{res.description}</p>
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
        ))}
      </div>
    </div>
  );
};
