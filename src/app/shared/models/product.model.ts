export interface Product {
  id: number;
  name: string;
  price: number;
}

export const Dummy_Product: Product[] = [
  { id: 1, name: 'เหล็กหนา', price: 10.70 },
  { id: 2, name: 'เหล็กบาง', price: 10.00 },
  { id: 3, name: 'กระป๋อง', price: 7.00 },
  { id: 4, name: 'กระดาษกล่อง', price: 4.50 },
  { id: 5, name: 'กระดาษสี', price: 3.40 },
];
