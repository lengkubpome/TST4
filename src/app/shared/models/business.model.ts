export interface Business {
  id: string;
  nameTH: string;
  nameEN: string;
  addressTH: string;
  addressEN: string;
  taxId: number;
  contact: { type: string; message: string }[];
}
