import React from 'react';
import {
  PlusCircle,
  QrCode,
  Layers,
  ClipboardCheck,
  BarChart3,
  Server,
  Monitor,
  Menu,
  X,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      id: 'add',
      label: 'Add Equipment',
      icon: <PlusCircle className="w-4 h-4" />,
    },
    {
      id: 'scanner',
      label: 'QR Scanner',
      icon: <QrCode className="w-4 h-4" />,
    },
    {
      id: 'inventory',
      label: 'Inventory Records',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'inspection',
      label: 'Inspection',
      icon: <ClipboardCheck className="w-4 h-4" />,
      badge: 'Later',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 className="w-4 h-4" />,
      badge: 'Later',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* App Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-white tracking-tight">LabEquip Ops</div>
              <div className="text-[10px] text-slate-400 font-medium">Computer Lab Maintenance</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Maintenance Dashboard
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}-btn`}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-indigo-700 text-indigo-100'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Series Format Hint Card */}
        <div className="p-3 mx-3 mb-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
          <div className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider mb-1">
            Series Code Format
          </div>
          <div className="font-mono text-xs font-bold text-white tracking-wide">
            INV.AE001.260909
          </div>
          <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            Standard format: Global prefix (INV) + 2 Random Letters & 3-Digit Counter + Acquisition Date (YYMMDD).
          </div>
        </div>

        {/* Database Status footer */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-slate-300">Firebase Firestore</span>
          </div>
          <Server className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </aside>
    </>
  );
};
