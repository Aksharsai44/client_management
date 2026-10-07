import React from 'react';
import { PricingPlan } from '../../types';
import { DollarSign, Plus, Check, Edit2, Trash2 } from 'lucide-react';

interface PricingPlansTabProps {
  pricingPlans: PricingPlan[];
  onOpenNewPlanModal: () => void;
  onEditPlan: (plan: PricingPlan) => void;
  deletePricingPlan: (id: string) => void;
}

export const PricingPlansTab: React.FC<PricingPlansTabProps> = ({
  pricingPlans,
  onOpenNewPlanModal,
  onEditPlan,
  deletePricingPlan,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Brochure Pricing Tier Customizer
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Customize plans, prices, and entitlement limits. All modifications instantly update the public Brochure page!
          </p>
        </div>
        <button
          onClick={onOpenNewPlanModal}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Pricing Tier</span>
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-2xs relative"
          >
            {plan.popular && (
              <span className="absolute -top-3 left-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Featured
              </span>
            )}

            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{plan.tagline}</p>
                </div>
              </div>

              <div className="mt-4 flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900">${plan.monthlyPrice}</span>
                <span className="text-xs text-slate-500">/mo &bull; ${plan.yearlyPrice}/yr</span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Features ({plan.features.length}):
                </p>
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="text-xs text-slate-600 flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                onClick={() => onEditPlan(plan)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Tier</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete plan ${plan.name}?`)) {
                    deletePricingPlan(plan.id);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
