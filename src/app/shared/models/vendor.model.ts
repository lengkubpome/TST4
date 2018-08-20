export interface Vendor {
  id: string;
  name: string;
  address: string;
  type: 'Individual' | 'corporate';
  bankAccout?: {
    accountName: string;
    accountNumber: number;
    bank: string;
  }[];
}
