import { Component, EventEmitter, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [CommonModule, MatButtonModule, MatToolbarModule,RouterLink,MatIconModule
  ]
})
export class NavbarComponent {
  @Output() logoutEvent = new EventEmitter<void>();
  currentRoute: string;
  constructor(private authService: AuthService, private router: Router) {
    this.currentRoute = this.router.url; 
  }

  // Método para cerrar sesión
  logout() {
    this.authService.logout();
    this.logoutEvent.emit();
    this.router.navigate(['/landing']);
  }
}
