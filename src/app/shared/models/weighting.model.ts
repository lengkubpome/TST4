import { Vendor } from './vendor.model';

export interface Weighting {
  id: string;
  dateLoadIn: Date;
  dateLoadOut: Date;
  car: string;
  // vendor?: Vendor;
  vendor?: string;
  customer?: string;
  product: string;
  price: number;
  weightIn: number;
  weightOut: number;
  cutWeight?: {
    value: number;
    unitType: string;
    note: string;
  };
  totalWeight: number;
  amount: number;
  type: 'buy' | 'sell';
  state: 'waiting' | 'completed' | 'cancelled';
  notes?: WeightingNote[];
}

export interface WeightingNote {
  type: string;
  value: string;
}
