import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  RefreshCw,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  Cpu,
  FileText,
  Building2,
  Barcode,
  Printer,
  Sparkles,
} from 'lucide-react';
import { Equipment, EquipmentCategory, EquipmentStatus } from '../types';
import { generateSeriesNumber, formatDateToYYMMDD } from '../utils/seriesGenerator';
import { createEquipment } from '../firebase';
import { PreviewModal } from './PreviewModal';
import { QRCodeDisplay } from './QRCodeDisplay';

interface AddEquipmentFormProps {
  initialSeriesNumber?: string;
  onSuccessNavigateToInventory?: () => void;
  onSuccessNavigateToScanner?: () => void;
}

const CATEGORIES: EquipmentCategory[] = [
  'Desktop PC',
  'Monitor',
  'Laptop',
  'Networking',
  'Projector / AV',
  'Printer / Scanner',
  'UPS / Power',
  'Peripherals',
  'Other',
];

const LAB_LOCATIONS = [
  'Lab 101 - Advanced Computing Lab',
  'Lab 102 - Networking & Systems Lab',
  'Lab 103 - Software Engineering Lab',
  'Lab 104 - Hardware & Robotics Lab',
  'Server & Infrastructure Room',
  'Faculty IT Workstation',
];

export const AddEquipmentForm: React.FC<AddEquipmentFormProps> = ({
  initialSeriesNumber,
  onSuccessNavigateToInventory,
  onSuccessNavigateToScanner,
}) => {
  // Counter state for series incrementing
  const [incrementCounter, setIncrementCounter] = useState<number>(1);
  const [randomLetters, setRandomLetters] = useState<string>('');

  // Form State
  const [seriesNumber, setSeriesNumber] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<EquipmentCategory>('Desktop PC');
  const [labLocation, setLabLocation] = useState<string>(LAB_LOCATIONS[0]);
  const [customLabLocation, setCustomLabLocation] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [manufacturerSerial, setManufacturerSerial] = useState<string>('');
  const [status, setStatus] = useState<EquipmentStatus>('operational');
  const [acquisitionDate, setAcquisitionDate] = useState<string>('2026-09-09');
  const [specifications, setSpecifications] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // UI Flow State
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedSuccessData, setSavedSuccessData] = useState<{
    id: string;
    seriesNumber: string;
    name: string;
  } | null>(null);

  // Initialize or regenerate series number
  const handleRegenerateSeries = (forcedCounter?: number) => {
    const counter = forcedCounter !== undefined ? forcedCounter : incrementCounter;
    const generated = generateSeriesNumber(acquisitionDate, counter);
    setRandomLetters(generated.breakdown.letters);
    setSeriesNumber(generated.seriesNumber);
  };

  // Initial load
  useEffect(() => {
    if (initialSeriesNumber) {
      setSeriesNumber(initialSeriesNumber);
    } else {
      handleRegenerateSeries(1);
    }
  }, [initialSeriesNumber]);

  // When acquisition date changes, keep date code in sync with series number
  const handleDateChange = (newDate: string) => {
    setAcquisitionDate(newDate);
    const generated = generateSeriesNumber(newDate, incrementCounter, randomLetters || undefined);
    setSeriesNumber(generated.seriesNumber);
  };

  // Form validation before preview
  const handleOpenPreview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter an Equipment Name (e.g. Dell OptiPlex 7090)');
      return;
    }

    if (!seriesNumber.trim()) {
      setErrorMsg('Series Number is required');
      return;
    }

    setIsPreviewOpen(true);
  };

  // Confirm and Save to Firestore
  const handleConfirmSave = async () => {
    setIsSaving(true);
    setErrorMsg(null);

    const finalLocation = labLocation === 'Other' ? customLabLocation : labLocation;

    const newEquipment: Omit<Equipment, 'id'> = {
      seriesNumber: seriesNumber.trim().toUpperCase(),
      name: name.trim(),
      category,
      brand: brand.trim(),
      model: model.trim(),
      labLocation: finalLocation || 'General Computer Lab',
      manufacturerSerial: manufacturerSerial.trim() || undefined,
      specifications: specifications.trim() || undefined,
      status,
      acquisitionDate,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      const docId = await createEquipment(newEquipment);
      setSavedSuccessData({
        id: docId,
        seriesNumber: newEquipment.seriesNumber,
        name: newEquipment.name,
      });

      // Prepare counter for the next item
      const nextCounter = incrementCounter + 1;
      setIncrementCounter(nextCounter);

      setIsPreviewOpen(false);
    } catch (err: unknown) {
      console.error('Save error', err);
      const msg = err instanceof Error ? err.message : 'Failed to save to Firebase';
      setErrorMsg(`Error saving to Firebase: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form to add another equipment
  const handleResetForNext = () => {
    setSavedSuccessData(null);
    setName('');
    setBrand('');
    setModel('');
    setManufacturerSerial('');
    setSpecifications('');
    setNotes('');
    setStatus('operational');
    // Generate next series number with incremented counter
    const nextCounter = incrementCounter;
    handleRegenerateSeries(nextCounter);
  };

  return (
    <div id="add-equipment-flow" className="max-w-5xl mx-auto space-y-6">
      {/* Success Notification Banner */}
      {savedSuccessData && (
        <div
          id="save-success-banner"
          className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Equipment Registered in Firebase
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {savedSuccessData.name}
              </h3>
              <p className="text-xs font-mono text-emerald-800 mt-0.5">
                QR Series: {savedSuccessData.seriesNumber}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="add-another-btn"
              type="button"
              onClick={handleResetForNext}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Another Equipment</span>
            </button>
            {onSuccessNavigateToScanner && (
              <button
                id="test-scan-btn"
                type="button"
                onClick={onSuccessNavigateToScanner}
                className="px-4 py-2 bg-white border border-emerald-300 hover:bg-emerald-100/60 text-emerald-800 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Barcode className="w-4 h-4" />
                <span>Test QR Scanner</span>
              </button>
            )}
            {onSuccessNavigateToInventory && (
              <button
                id="view-inventory-btn"
                type="button"
                onClick={onSuccessNavigateToInventory}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                <span>View in Inventory</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <PlusCircle className="w-6 h-6 text-indigo-600" />
              Register New Equipment
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Add computer lab hardware to the Firebase inventory with unique QR series tracking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Auto Series Format:</span>
            <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
              INV.XX000.YYMMDD
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleOpenPreview} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Equipment Inputs */}
            <div className="lg:col-span-2 space-y-5">
              {/* Series Number Display & Generator */}
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Barcode className="w-4 h-4 text-indigo-600" />
                    Unique QR Series Number
                  </label>
                  <button
                    id="regenerate-series-btn"
                    type="button"
                    onClick={() => handleRegenerateSeries()}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate Series</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="series-number-input"
                    type="text"
                    value={seriesNumber}
                    onChange={(e) => setSeriesNumber(e.target.value.toUpperCase())}
                    placeholder="INV.AE001.260909"
                    required
                    className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold tracking-wider text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 uppercase"
                  />
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    (Editable if needed)
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                  <span>
                    <strong className="text-slate-700">INV</strong>: Global Equipment
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-slate-700">AE</strong>: 2 Random Letters
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-slate-700">001</strong>: #{incrementCounter} Sequence
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-slate-700">{formatDateToYYMMDD(acquisitionDate)}</strong>: Acquisition Date
                  </span>
                </div>
              </div>

              {/* Equipment Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Equipment Name *
                </label>
                <input
                  id="equipment-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dell OptiPlex 7090 Desktop Tower"
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Category & Lab Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    Equipment Category *
                  </label>
                  <select
                    id="equipment-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EquipmentCategory)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Lab Room / Location *
                  </label>
                  <select
                    id="lab-location-select"
                    value={labLocation}
                    onChange={(e) => setLabLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {LAB_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                    <option value="Other">Custom Location...</option>
                  </select>
                  {labLocation === 'Other' && (
                    <input
                      type="text"
                      value={customLabLocation}
                      onChange={(e) => setCustomLabLocation(e.target.value)}
                      placeholder="Enter custom lab location"
                      className="mt-2 w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  )}
                </div>
              </div>

              {/* Brand, Model & Manufacturer Serial */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Brand / Make
                  </label>
                  <input
                    id="equipment-brand-input"
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Dell, HP, Cisco"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Model Number
                  </label>
                  <input
                    id="equipment-model-input"
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. OptiPlex 7090"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    MFR Serial No.
                  </label>
                  <input
                    id="equipment-serial-input"
                    type="text"
                    value={manufacturerSerial}
                    onChange={(e) => setManufacturerSerial(e.target.value)}
                    placeholder="e.g. 8XYZ789"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              {/* Acquisition Date & Initial Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Acquisition Date *
                  </label>
                  <input
                    id="acquisition-date-input"
                    type="date"
                    value={acquisitionDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Sets YYMMDD code ({formatDateToYYMMDD(acquisitionDate)}) in series number
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Initial Status *
                  </label>
                  <select
                    id="equipment-status-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EquipmentStatus)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="operational">Operational / In-Service</option>
                    <option value="maintenance_required">Needs Maintenance</option>
                    <option value="under_repair">Under Repair</option>
                    <option value="decommissioned">Decommissioned</option>
                  </select>
                </div>
              </div>

              {/* Hardware Specifications */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-slate-400" />
                  Hardware Specifications
                </label>
                <input
                  id="equipment-specs-input"
                  type="text"
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  placeholder="e.g. Intel Core i7-11700, 16GB DDR4, 512GB NVMe SSD, Intel UHD 750"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Maintenance & Asset Notes
                </label>
                <textarea
                  id="equipment-notes-input"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Assigned to Station PC-14. Annual servicing due every September."
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Right Column: Live QR Preview & Action Trigger */}
            <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col items-center">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                  Live QR Code Tag
                </span>

                <QRCodeDisplay
                  seriesNumber={seriesNumber || 'INV.AE001.260909'}
                  equipmentName={name || 'New Equipment'}
                  labLocation={labLocation === 'Other' ? customLabLocation : labLocation}
                  size={160}
                  showActions={true}
                />

                <p className="text-[11px] text-slate-500 text-center mt-3 leading-relaxed">
                  This QR code encodes the unique series number <strong className="font-mono">{seriesNumber}</strong> to allow instant lookup via the scanner.
                </p>
              </div>

              {/* Submit CTA Button */}
              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 text-xs font-semibold">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Ready to save?</span>
                </div>
                <p className="text-[11px] text-indigo-700 leading-relaxed">
                  Click below to open the preview modal, inspect all fields and barcode metadata, and commit to the Firebase Firestore database.
                </p>

                <button
                  id="preview-entry-submit-btn"
                  type="submit"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Entry & Save</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onConfirm={handleConfirmSave}
        equipmentData={{
          seriesNumber: seriesNumber.trim().toUpperCase(),
          name: name.trim(),
          category,
          brand: brand.trim(),
          model: model.trim(),
          labLocation: labLocation === 'Other' ? customLabLocation : labLocation,
          manufacturerSerial: manufacturerSerial.trim() || undefined,
          specifications: specifications.trim() || undefined,
          status,
          acquisitionDate,
          notes: notes.trim() || undefined,
          createdAt: new Date().toISOString(),
        }}
        isSaving={isSaving}
      />
    </div>
  );
};
