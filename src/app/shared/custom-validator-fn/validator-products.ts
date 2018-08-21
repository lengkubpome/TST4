import { ValidatorFn, AbstractControl } from '@angular/forms';
import { Product } from '../models/product.model';

export function forbiddenProducts(products: Product[]): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    const forbiddenProduct = control.value;

    const result = products.find(item => item.name === forbiddenProduct) ? { forbiddenProduct } : null;

    return result;
  };
}
export function allowedProducts(products: Product[]): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    const allowedProduct = control.value;

    const result = products.find(item => item.name === allowedProduct) ? null : { allowedProduct };

    return result;
  };
}
