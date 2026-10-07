import React, { useState } from 'react';
import { PricingPlan } from '../../../types';

interface PricingPlanModalProps {
  editingPlan: PricingPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: PricingPlan | Omit<PricingPlan, 'id'>) => void;
}

export const PricingPlanModal: React.FC<PricingPlanModalProps> = ({
  editingPlan,
  isOpen,
  onClose,
  onSave,
}) => {
  const [currentPlan, setCurrentPlan] = useState<PricingPlan | Omit<PricingPlan, 'id'>>(() => {
    if (editingPlan) return { ...editingPlan };
    return {
      name: 'Enterprise Growth Tier',
      tagline: 'Engineered for scaling distributed enterprise accounts',
      monthlyPrice: 249,
      yearlyPrice: 2390,
      popular: false,
      features: [
        'Up to 250 Active Portal Users',
        'Unlimited Client Batches',
        'AI Meeting Transcripts & Q&A',
        'WhatsApp Integration & Alerts',
        'PDF Attendance Audit Reports',
      ],
      maxUsers: 250,
      maxClients: 50,
      whatsAppIntegration: true,
      emailAlerts: true,
      aiTranscripts: true,
      customBranding: true,
    };
  });

  const [featureDraft, setFeatureDraft] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {editingPlan ? `Edit Tier: ${currentPlan.name}` : 'Add New Pricing Tier'}
            </h3>
            <p className="text-xs text-slate-500">
              Changes sync live to the public Brochure page immediately.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            &times;
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Plan Name</label>
            <input
              type="text"
              value={currentPlan.name}
              onChange={(e) => setCurrentPlan({ ...currentPlan, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tagline</label>
            <input
              type="text"
              value={currentPlan.tagline}
              onChange={(e) => setCurrentPlan({ ...currentPlan, tagline: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Monthly Price ($)
              </label>
              <input
                type="number"
                value={currentPlan.monthlyPrice}
                onChange={(e) =>
                  setCurrentPlan({ ...currentPlan, monthlyPrice: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Yearly Price ($)
              </label>
              <input
                type="number"
                value={currentPlan.yearlyPrice}
                onChange={(e) =>
                  setCurrentPlan({ ...currentPlan, yearlyPrice: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Features</label>
            <div className="space-y-1.5 mb-2 max-h-32 overflow-y-auto">
              {currentPlan.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg text-xs"
                >
                  <span className="text-slate-700">{feat}</span>
                  <button
                    onClick={() => {
                      setCurrentPlan({
                        ...currentPlan,
                        features: currentPlan.features.filter((_, i) => i !== idx),
                      });
                    }}
                    className="text-slate-400 hover:text-rose-600 font-bold"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={featureDraft}
                onChange={(e) => setFeatureDraft(e.target.value)}
                placeholder="Add feature item..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
              />
              <button
                onClick={() => {
                  if (!featureDraft.trim()) return;
                  setCurrentPlan({
                    ...currentPlan,
                    features: [...currentPlan.features, featureDraft.trim()],
                  });
                  setFeatureDraft('');
                }}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="popularCheck"
              checked={!!currentPlan.popular}
              onChange={(e) => setCurrentPlan({ ...currentPlan, popular: e.target.checked })}
              className="rounded text-blue-600"
            />
            <label htmlFor="popularCheck" className="text-xs font-bold text-slate-700">
              Highlight as Popular Enterprise Tier on Brochure
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(currentPlan);
              onClose();
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
          >
            Save & Update Brochure
          </button>
        </div>
      </div>
    </div>
  );
};
