import { ValidatorFn, AbstractControl } from '@angular/forms';
import { Product } from '../../../shared/models/product.model';


export function forbiddenProducts(products: Product[]): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    const product = control.value;

    const result = products.find(item => item.name === product) ?
      null : { product };

    // console.log(result);

    return result;
  };

}
