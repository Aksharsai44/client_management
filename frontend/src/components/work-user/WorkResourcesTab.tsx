import React from 'react';
import { ResourceItem } from '../../types';
import { Upload } from 'lucide-react';

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
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Uploaded Engineering Deliverables & Client Reviews
          </h2>
          <p className="text-xs text-slate-500">
            Upload architecture diagrams, audit reports, and see client ratings & 5-star reviews.
          </p>
        </div>
        <button
          onClick={onOpenUpload}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Deliverable</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {batchResources.map((res) => (
          <div
            key={res.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{res.fileType}</span>
                <span>{res.fileSize}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-1">{res.title}</h3>
              <p className="text-xs text-slate-600 mt-1">{res.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>
                  Uploaded by: <b className="text-slate-800">{res.uploaderName}</b>
                </span>
                <span>{res.uploadedAt}</span>
              </div>

              {/* Client Reviews on this item */}
              {res.reviews && res.reviews.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Client Ratings & Feedback:
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
        ))}
      </div>
    </div>
  );
};
