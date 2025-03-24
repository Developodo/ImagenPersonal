import { Component, Signal, signal, ViewChild, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  imports: [CommonModule, MatButtonModule, MatSnackBarModule,FooterComponent]
})
export class LandingComponent {
  @ViewChild('pinInput') pinInput: any;
  pin: WritableSignal<string> = signal('');
  isShaking = signal(false);

  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {}
  ngAfterViewInit() {
    this.pinInput.nativeElement.focus();
  }
  focusInput() {
    this.pinInput.nativeElement.focus();
  }
  async updatePin(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input) return;
  
    const value = input.value;
    if (value.length > 4) return; // Evita que pase más de 4 caracteres
  
    this.pin.set(value);
  
    if (value.length === 4) {
      try {
        const success = await this.authService.login(value);
        console.log(success)
        if (success) {
          this.router.navigate(['/modules']);
        } else {
          this.triggerShakeAnimation();
        }
      } catch (error) {
        console.error('Error en autenticación:', error);
        this.triggerShakeAnimation();
      }
    }
  }
  
  ngOnInit(): void {
    localStorage.removeItem('searchTerm');
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/modules']); // Redirige si está logueado
    }
  }

  private triggerShakeAnimation() {
    this.isShaking.set(true);
    setTimeout(() => this.isShaking.set(false), 500);
    this.pin.set('');
  }
}
