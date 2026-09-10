export type EquipmentStatus = 'operational' | 'maintenance_required' | 'under_repair' | 'decommissioned';

export type EquipmentCategory =
  | 'Desktop PC'
  | 'Monitor'
  | 'Laptop'
  | 'Networking'
  | 'Projector / AV'
  | 'Printer / Scanner'
  | 'UPS / Power'
  | 'Peripherals'
  | 'Other';

export interface Equipment {
  id?: string;
  seriesNumber: string; // e.g. INV.AE001.260909
  name: string; // e.g. Dell OptiPlex 7090
  category: EquipmentCategory;
  brand: string; // e.g. Dell, Cisco, Epson
  model: string; // e.g. OptiPlex 7090
  labLocation: string; // e.g. Lab 101 - Workstation 12
  manufacturerSerial?: string;
  specifications?: string; // e.g. Intel i7, 16GB RAM, 512GB SSD
  status: EquipmentStatus;
  acquisitionDate: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SeriesBreakdown {
  prefix: string; // INV
  tag: string; // AE001
  letters: string; // AE
  counter: string; // 001
  dateCode: string; // 260909
  fullCode: string; // INV.AE001.260909
}

export type ActiveTab = 'add' | 'scanner' | 'inventory' | 'inspection' | 'reports';
