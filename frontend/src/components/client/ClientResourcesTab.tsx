import React from 'react';
import { ResourceItem } from '../../types';
import { Upload, Star } from 'lucide-react';

interface ClientResourcesTabProps {
  batchResources: ResourceItem[];
  onOpenUpload: () => void;
  onOpenReview: (resId: string) => void;
}

export const ClientResourcesTab: React.FC<ClientResourcesTabProps> = ({
  batchResources,
  onOpenUpload,
  onOpenReview,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Shared Documents, Reports & Star Reviews
          </h2>
          <p className="text-xs text-slate-500">
            Submit reviews and star ratings on delivered project artifacts.
          </p>
        </div>
        <button
          onClick={onOpenUpload}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
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

              {/* Reviews */}
              {res.reviews && res.reviews.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-100">
                  {res.reviews.map((rev) => (
                    <div key={rev.id} className="p-2 bg-amber-50 rounded-lg text-xs">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-800">{rev.reviewerName}</span>
                        <span className="text-amber-500 font-bold">
                          {'★'.repeat(rev.rating)}
                          {'☆'.repeat(5 - rev.rating)}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{rev.feedback}</p>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => onOpenReview(res.id)}
                className="w-full py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold border border-amber-200 flex items-center justify-center space-x-1"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Submit Star Rating & Review</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
