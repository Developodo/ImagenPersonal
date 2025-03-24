import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private snackBar = inject(MatSnackBar);

  showInfo(message: string, duration: number = 5000) {
    this.snackBar.open(message, 'OK', {
      duration,
      panelClass: ['snackbar-info'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
