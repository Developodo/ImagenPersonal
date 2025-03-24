import { inject, Injectable, signal } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  isLoading = signal(false);
  private timeoutId: any;
  private toastService = inject(ToastService)

  show() {
    this.hide();
    this.isLoading.set(true);

    // Si el loading dura más de 5 segundos, oculta y lanza error
    this.timeoutId = setTimeout(() => {
      console.error('⛔ Error: Carga demasiado larga.');
      this.toastService.showInfo('⛔ Error: Carga demasiado larga.');
      this.hide();
    }, 5000);
  }

  hide() {
    this.isLoading.set(false);
    clearTimeout(this.timeoutId); // Cancela el timeout si el loading se oculta antes de 5s
  }
}