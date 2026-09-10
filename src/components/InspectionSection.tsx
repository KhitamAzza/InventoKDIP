import React from 'react';
import { ClipboardCheck, Calendar, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface InspectionSectionProps {
  onNavigateToScanner: () => void;
}

export const InspectionSection: React.FC<InspectionSectionProps> = ({ onNavigateToScanner }) => {
  return (
    <div id="inspection-view" className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Lab Equipment Inspection</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                Phase 2 Planned
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Periodic inspection rounds, hardware diagnostics, and preventive maintenance logs.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Routine Inspection Rounds</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Schedule weekly or monthly computer lab inspections. Lab technicians scan the QR code at each student workstation to mark inspection check-offs.
            </p>
            <div className="pt-2 text-[11px] text-slate-400">
              Planned features: Visual condition grading, cable safety checklist, dust/fan status.
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Issue Flagging & Repair Orders</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Log failing components (damaged RAM, faulty monitor ports, broken keyboards) linked directly to the equipment series ID for technician follow-up.
            </p>
            <div className="pt-2 text-[11px] text-slate-400">
              Planned features: Repair status tracking, service tickets, technician assignment.
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-indigo-900">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>In the meantime, you can inspect individual items directly using the QR scanner:</span>
          </div>
          <button
            type="button"
            onClick={onNavigateToScanner}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            Launch QR Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
