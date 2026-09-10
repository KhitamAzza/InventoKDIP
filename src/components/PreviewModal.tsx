import React from 'react';
import { X, Check, ArrowLeft, Loader2, QrCode, ShieldCheck, Tag } from 'lucide-react';
import { Equipment } from '../types';
import { parseSeriesNumber } from '../utils/seriesGenerator';
import { QRCodeDisplay } from './QRCodeDisplay';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  equipmentData: Omit<Equipment, 'id'>;
  isSaving: boolean;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  equipmentData,
  isSaving,
}) => {
  if (!isOpen) return null;

  const breakdown = parseSeriesNumber(equipmentData.seriesNumber);

  return (
    <div
      id="preview-equipment-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Preview Equipment Registration
              </h2>
              <p className="text-xs text-slate-500">
                Review equipment details and verify QR series number before saving
              </p>
            </div>
          </div>
          <button
            id="close-preview-modal-btn"
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-130px)]">
          {/* QR Code & Series Anatomy Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-6">
            <div className="shrink-0">
              <QRCodeDisplay
                seriesNumber={equipmentData.seriesNumber}
                equipmentName={equipmentData.name}
                labLocation={equipmentData.labLocation}
                size={140}
                showActions={false}
              />
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5" />
                <span>QR Series Anatomy</span>
              </div>

              {breakdown ? (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Prefix</span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-indigo-600">
                      {breakdown.prefix}
                    </span>
                    <span className="text-[9px] text-slate-500 block">Equipment</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Random+Inc</span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-slate-900">
                      {breakdown.tag}
                    </span>
                    <span className="text-[9px] text-slate-500 block">
                      {breakdown.letters} + #{breakdown.counter}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Acquisition</span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-emerald-600">
                      {breakdown.dateCode}
                    </span>
                    <span className="text-[9px] text-slate-500 block">YYMMDD</span>
                  </div>
                </div>
              ) : (
                <div className="font-mono text-sm font-bold text-slate-800 bg-white p-2 rounded border border-slate-200">
                  {equipmentData.seriesNumber}
                </div>
              )}

              <p className="text-[11px] text-slate-500 leading-relaxed">
                This QR tag will be permanently associated with this equipment in the database for instant maintenance checks.
              </p>
            </div>
          </div>

          {/* Details Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
            <div className="grid grid-cols-3 p-3 bg-white">
              <span className="text-slate-500 font-medium">Equipment Name</span>
              <span className="col-span-2 font-semibold text-slate-900">{equipmentData.name}</span>
            </div>
            <div className="grid grid-cols-3 p-3 bg-slate-50/50">
              <span className="text-slate-500 font-medium">Category</span>
              <span className="col-span-2 text-slate-800 font-medium">{equipmentData.category}</span>
            </div>
            <div className="grid grid-cols-3 p-3 bg-white">
              <span className="text-slate-500 font-medium">Lab Room / Location</span>
              <span className="col-span-2 text-slate-800 font-medium">{equipmentData.labLocation}</span>
            </div>
            <div className="grid grid-cols-3 p-3 bg-slate-50/50">
              <span className="text-slate-500 font-medium">Brand & Model</span>
              <span className="col-span-2 text-slate-800">
                {equipmentData.brand || '—'} {equipmentData.model ? `(${equipmentData.model})` : ''}
              </span>
            </div>
            {equipmentData.manufacturerSerial && (
              <div className="grid grid-cols-3 p-3 bg-white">
                <span className="text-slate-500 font-medium">Manufacturer S/N</span>
                <span className="col-span-2 font-mono text-slate-800">{equipmentData.manufacturerSerial}</span>
              </div>
            )}
            <div className="grid grid-cols-3 p-3 bg-slate-50/50">
              <span className="text-slate-500 font-medium">Current Status</span>
              <span className="col-span-2">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                    equipmentData.status === 'operational'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : equipmentData.status === 'maintenance_required'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : equipmentData.status === 'under_repair'
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {equipmentData.status.replace('_', ' ')}
                </span>
              </span>
            </div>
            <div className="grid grid-cols-3 p-3 bg-white">
              <span className="text-slate-500 font-medium">Acquisition Date</span>
              <span className="col-span-2 text-slate-800 font-medium">{equipmentData.acquisitionDate}</span>
            </div>
            {equipmentData.specifications && (
              <div className="grid grid-cols-3 p-3 bg-slate-50/50">
                <span className="text-slate-500 font-medium">Specifications</span>
                <span className="col-span-2 text-slate-700">{equipmentData.specifications}</span>
              </div>
            )}
            {equipmentData.notes && (
              <div className="grid grid-cols-3 p-3 bg-white">
                <span className="text-slate-500 font-medium">Notes</span>
                <span className="col-span-2 text-slate-700">{equipmentData.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            id="modal-back-btn"
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Edit Details</span>
          </button>

          <button
            id="modal-confirm-save-btn"
            type="button"
            onClick={onConfirm}
            disabled={isSaving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to Firebase...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm & Save to Database</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
