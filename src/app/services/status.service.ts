import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  isChanged = false;
  constructor() { }
}
