import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { StatusService } from '../services/status.service';

export const exitGuard: CanDeactivateFn<unknown> = (component, currentRoute, currentState, nextState) => {
  const status=inject(StatusService);
  if(status.isChanged){
    return confirm('Tienes cambios sin guardar. ¿Seguro que quieres salir?');
  }
  return true;
};
