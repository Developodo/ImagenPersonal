import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'normalizesearch',
  standalone: true
})
export class NormalizesearchPipe implements PipeTransform {

  transform(value: any, searchText: string): any {
    if (!value || !searchText) {
      return value;
    }
    
    const normalizeString = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '');

    const normalizedSearchText = normalizeString(searchText);
    return value.filter((item:any) =>
      normalizeString(item).includes(normalizedSearchText)
    );
  }
}
