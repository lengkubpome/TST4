export interface Product {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

export interface ProductChangeLog {
  id: Date;
  product: Product;
  from?: Product;
  changed?: Product;
  state: string;
  recorder: string;
  // dateChange: Date;
}

export const Dummy_Product: Product[] = [
  { id: '1', name: 'เหล็กหนา', price: 10.7, active: true },
  { id: '2', name: 'เหล็กบาง', price: 10.0, active: true },
  { id: '3', name: 'กระป๋อง', price: 7.0, active: true },
  { id: '4', name: 'กระดาษกล่อง', price: 4.5, active: true },
  { id: '5', name: 'กระดาษสี', price: 3.4, active: true }
];
