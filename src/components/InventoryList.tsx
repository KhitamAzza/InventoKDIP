import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Layers,
  Printer,
  Barcode,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  XCircle,
  Clock,
  MapPin,
  Tag,
  Plus,
} from 'lucide-react';
import { Equipment, EquipmentCategory, EquipmentStatus } from '../types';
import { subscribeEquipments, updateEquipment } from '../firebase';
import { QRCodeDisplay } from './QRCodeDisplay';

interface InventoryListProps {
  onNavigateToAdd: () => void;
  onNavigateToScannerWithSeries?: (series: string) => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({
  onNavigateToAdd,
  onNavigateToScannerWithSeries,
}) => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQrItem, setSelectedQrItem] = useState<Equipment | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeEquipments(
      (items) => {
        setEquipments(items);
        setLoading(false);
      },
      (err) => {
        console.warn('Subscription error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filtered equipment list
  const filtered = equipments.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.seriesNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.labLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.model?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter;

    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Quick status update
  const handleQuickStatusUpdate = async (
    id: string,
    newStatus: EquipmentStatus
  ) => {
    try {
      setUpdatingId(id);
      await updateEquipment(id, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Stats
  const totalCount = equipments.length;
  const operationalCount = equipments.filter((e) => e.status === 'operational').length;
  const maintenanceCount = equipments.filter(
    (e) => e.status === 'maintenance_required' || e.status === 'under_repair'
  ).length;

  return (
    <div id="inventory-list-view" className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Stats bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Equipment Inventory & QR Database
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage all computer lab hardware, view generated QR series codes, and update maintenance conditions.
          </p>
        </div>

        <button
          id="inventory-add-new-btn"
          type="button"
          onClick={onNavigateToAdd}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Equipment</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Total Registered</div>
            <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Operational Assets</div>
            <div className="text-2xl font-bold text-emerald-600">{operationalCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Maintenance / Repair</div>
            <div className="text-2xl font-bold text-amber-600">{maintenanceCount}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="inventory-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by series code (INV.AE001...), name, room, brand..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            id="inventory-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 cursor-pointer w-1/2 md:w-auto"
          >
            <option value="all">All Categories</option>
            <option value="Desktop PC">Desktop PC</option>
            <option value="Monitor">Monitor</option>
            <option value="Laptop">Laptop</option>
            <option value="Networking">Networking</option>
            <option value="Projector / AV">Projector / AV</option>
            <option value="Printer / Scanner">Printer / Scanner</option>
            <option value="UPS / Power">UPS / Power</option>
            <option value="Peripherals">Peripherals</option>
            <option value="Other">Other</option>
          </select>

          <select
            id="inventory-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 cursor-pointer w-1/2 md:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="operational">Operational</option>
            <option value="maintenance_required">Needs Maintenance</option>
            <option value="under_repair">Under Repair</option>
            <option value="decommissioned">Decommissioned</option>
          </select>
        </div>
      </div>

      {/* Equipment List / Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200 animate-pulse text-sm">
          Loading inventory records from Firebase...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Barcode className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            {equipments.length === 0 ? 'No equipment registered yet' : 'No matching equipment found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {equipments.length === 0
              ? 'Start by registering your first computer lab equipment with an auto-generated QR series number.'
              : 'Try clearing your search query or filters to view other equipment.'}
          </p>
          {equipments.length === 0 && (
            <button
              type="button"
              onClick={onNavigateToAdd}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Equipment</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id || item.seriesNumber}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-200 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                {/* Top Badge & Series Code */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 select-all">
                    {item.seriesNumber}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                      item.status === 'operational'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.status === 'maintenance_required'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : item.status === 'under_repair'
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Name & Category */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-700 font-medium">
                      {item.category}
                    </span>
                    {item.brand && (
                      <span>
                        {item.brand} {item.model}
                      </span>
                    )}
                  </div>
                </div>

                {/* Location & Date */}
                <div className="text-xs text-slate-600 space-y-1 pt-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.labLocation}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Acquired: {item.acquisitionDate}</span>
                  </div>
                </div>

                {/* Hardware Specs summary if present */}
                {item.specifications && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2">
                    {item.specifications}
                  </p>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedQrItem(item)}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    title="View QR Code & Print Sticker"
                  >
                    <Barcode className="w-4 h-4" />
                    <span>QR Tag</span>
                  </button>

                  {onNavigateToScannerWithSeries && (
                    <button
                      type="button"
                      onClick={() => onNavigateToScannerWithSeries(item.seriesNumber)}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      title="Inspect in Scanner"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  )}
                </div>

                {/* Status Toggle Dropdown */}
                {item.id && (
                  <select
                    value={item.status}
                    disabled={updatingId === item.id}
                    onChange={(e) =>
                      item.id && handleQuickStatusUpdate(item.id, e.target.value as EquipmentStatus)
                    }
                    className="text-[11px] px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700 cursor-pointer font-medium"
                  >
                    <option value="operational">Operational</option>
                    <option value="maintenance_required">Needs Maintenance</option>
                    <option value="under_repair">Under Repair</option>
                    <option value="decommissioned">Decommissioned</option>
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Popup Modal */}
      {selectedQrItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Equipment QR Asset Tag</h3>
              <button
                type="button"
                onClick={() => setSelectedQrItem(null)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                Close
              </button>
            </div>

            <QRCodeDisplay
              seriesNumber={selectedQrItem.seriesNumber}
              equipmentName={selectedQrItem.name}
              labLocation={selectedQrItem.labLocation}
              size={180}
              showActions={true}
            />

            <button
              type="button"
              onClick={() => setSelectedQrItem(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
