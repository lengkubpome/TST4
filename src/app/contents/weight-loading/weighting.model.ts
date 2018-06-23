
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
  cutWeight?: number;
  totalWeight: number;
  amount: number;
  state: 'waiting' | 'completed' | 'cancelled';
  recorder: string;
  description?: string;
}


