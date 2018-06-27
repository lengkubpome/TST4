import { Note } from './shared/note.model';

export interface Weighting {
  id: string;
  dateLoadIn: Date;
  dateLoadOut: Date;
  car: string;
  customer?: string;
  product: string;
  price: number;
  weightIn: number;
  weightOut: number;
  cutWeight?: CutWeight;
  totalWeight: number;
  amount: number;
  type: 'buy' | 'sell' | 'other';
  state: 'waiting' | 'completed' | 'cancelled';
  recorder: string;
  note?: Note[];
}

interface CutWeight {
  value: number;
  unitType: string;
  note: string;

}


