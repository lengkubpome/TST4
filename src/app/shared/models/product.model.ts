export interface Product {
  id: string;
  name: string;
  price: number;
  status: 'active' | 'inactive';
}
export interface ProductChangeLog {
  id: number;
  price: number;
  dateChange: Date;
}

export const Dummy_Product: Product[] = [
  { id: '1', name: 'เหล็กหนา', price: 10.7, status: 'active' },
  { id: '2', name: 'เหล็กบาง', price: 10.0, status: 'active' },
  { id: '3', name: 'กระป๋อง', price: 7.0, status: 'active' },
  { id: '4', name: 'กระดาษกล่อง', price: 4.5, status: 'active' },
  { id: '5', name: 'กระดาษสี', price: 3.4, status: 'active' }
];
