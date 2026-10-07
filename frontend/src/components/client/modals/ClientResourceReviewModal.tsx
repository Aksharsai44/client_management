import React, { useState } from 'react';

interface ClientResourceReviewModalProps {
  targetResId: string | null;
  onClose: () => void;
  onSubmit: (resId: string, rating: number, feedback: string) => void;
}

export const ClientResourceReviewModal: React.FC<ClientResourceReviewModalProps> = ({
  targetResId,
  onClose,
  onSubmit,
}) => {
  const [starRating, setStarRating] = useState(5);
  const [reviewFeedback, setReviewFeedback] = useState('');

  if (!targetResId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm">Submit Deliverable Review</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            &times;
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Star Rating (1 - 5)
            </label>
            <div className="flex space-x-2 text-2xl cursor-pointer text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStarRating(s)}
                  className="focus:outline-none"
                >
                  {s <= starRating ? '★' : '☆'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Feedback Description
            </label>
            <textarea
              rows={3}
              value={reviewFeedback}
              onChange={(e) => setReviewFeedback(e.target.value)}
              placeholder="Provide your assessment on this report..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSubmit(targetResId, starRating, reviewFeedback);
              onClose();
            }}
            className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};
