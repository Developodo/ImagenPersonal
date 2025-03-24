import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstletter',
  standalone: true
})
export class FirstletterPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): unknown {
    if (!value) return '';
    if(value.toLocaleLowerCase()=='miércoles') value='xiercoles'
    return value.charAt(0).toUpperCase();
  }

}
