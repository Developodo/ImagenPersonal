import { Component, computed, inject } from '@angular/core';
import { LoadingService } from '../../services/loading.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports:[MatProgressSpinnerModule],
  template: `
  @if(isLoading()){
    <div class="loading-overlay">
      <mat-spinner></mat-spinner>
    </div>
}
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(0, 0, 0, 0.3);
      z-index: 9998;
    }
  `]
})
export class LoadingComponent {
  private loadingService:any = inject(LoadingService);
  isLoading = computed(() => this.loadingService.isLoading()); // Reacción automática al estado de carga
}
