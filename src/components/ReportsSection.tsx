import React from 'react';
import { BarChart3, FileSpreadsheet, Download, Layers, CheckCircle2 } from 'lucide-react';

export const ReportsSection: React.FC = () => {
  return (
    <div id="reports-view" className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Lab Reports & Asset Analytics</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                Phase 2 Planned
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Comprehensive inventory auditing, maintenance history logs, and CSV/PDF export generation.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Lab Health & Uptime Breakdown</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track operational uptime per computer lab (Lab 101, 102, Server Room), identify aging hardware nearing end-of-life, and flag high-failure models.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Institutional Audit Export</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generate standardized asset registry sheets for university/school annual inventory audits with series numbers, acquisition dates, and depreciation values.
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
          <span>Detailed export formats (Excel / CSV / Printable PDF tags) will unlock with backend reporting integration.</span>
        </div>
      </div>
    </div>
  );
};
