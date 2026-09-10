import React, { useState } from 'react';
import {
  Menu,
  PlusCircle,
  QrCode,
  Layers,
  ClipboardCheck,
  BarChart3,
  Server,
  Shield,
} from 'lucide-react';
import { ActiveTab } from './types';
import { Sidebar } from './components/Sidebar';
import { AddEquipmentForm } from './components/AddEquipmentForm';
import { QRScanner } from './components/QRScanner';
import { InventoryList } from './components/InventoryList';
import { InspectionSection } from './components/InspectionSection';
import { ReportsSection } from './components/ReportsSection';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('add');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [passedSeriesNumber, setPassedSeriesNumber] = useState<string | undefined>(undefined);

  // Navigate to Add Equipment with a pre-filled series number from scanner
  const handleNavigateToAddWithSeries = (series: string) => {
    setPassedSeriesNumber(series);
    setActiveTab('add');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col lg:flex-row antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'add') setPassedSeriesNumber(undefined);
          setActiveTab(tab);
        }}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 pb-16 lg:pb-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <button
            id="mobile-menu-toggle-btn"
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900">LabEquip Ops</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              Firebase
            </span>
          </div>

          <button
            id="mobile-quick-scan-btn"
            type="button"
            onClick={() => setActiveTab('scanner')}
            className={`p-2 rounded-lg cursor-pointer transition-colors ${
              activeTab === 'scanner'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Open QR Scanner"
          >
            <QrCode className="w-5 h-5" />
          </button>
        </header>

        {/* Desktop Top Header Bar */}
        <header className="hidden lg:flex h-16 bg-white border-b border-slate-200/80 px-8 items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-slate-800 capitalize tracking-tight">
              {activeTab === 'add' && 'Add New Equipment'}
              {activeTab === 'scanner' && 'Equipment QR Code Scanner'}
              {activeTab === 'inventory' && 'Computer Lab Inventory Records'}
              {activeTab === 'inspection' && 'Scheduled Inspections (Roadmap)'}
              {activeTab === 'reports' && 'Equipment Reports & Audits (Roadmap)'}
            </h2>
            {activeTab === 'add' && (
              <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold px-2 py-0.5 rounded-full">
                Primary Flow
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span>Series Format: <strong className="font-mono text-indigo-700">INV.AE001.YYMMDD</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg font-medium">
              <Server className="w-3.5 h-3.5 text-emerald-600" />
              <span>Firestore Connected</span>
            </div>
          </div>
        </header>

        {/* Main Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === 'add' && (
            <AddEquipmentForm
              initialSeriesNumber={passedSeriesNumber}
              onSuccessNavigateToInventory={() => setActiveTab('inventory')}
              onSuccessNavigateToScanner={() => setActiveTab('scanner')}
            />
          )}

          {activeTab === 'scanner' && (
            <QRScanner
              onNavigateToAddWithSeries={handleNavigateToAddWithSeries}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryList
              onNavigateToAdd={() => setActiveTab('add')}
              onNavigateToScannerWithSeries={(series) => {
                setActiveTab('scanner');
              }}
            />
          )}

          {activeTab === 'inspection' && (
            <InspectionSection onNavigateToScanner={() => setActiveTab('scanner')} />
          )}

          {activeTab === 'reports' && <ReportsSection />}
        </main>

        {/* Mobile Bottom Navigation Bar for quick thumb navigation */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around z-30 shadow-lg">
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
              activeTab === 'add' ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add Item</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scanner')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
              activeTab === 'scanner' ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span>Scan QR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
              activeTab === 'inventory' ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span>Inventory</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inspection')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
              activeTab === 'inspection' ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`}
          >
            <ClipboardCheck className="w-5 h-5" />
            <span>Inspect</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
