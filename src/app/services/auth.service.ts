import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly hashedPin = 'b2b2f104d32c638903e151a9b20d6e27b41d8c0c84cf8458738f83ca2f1dd744'; // SHA-256 de ''
  private isAuthenticated = false;

  constructor(private router: Router) {
    this.checkSession();
  }

  async login(pin: string): Promise<boolean> {
    const pinHash = await this.hashPin(pin);
    if (pinHash === this.hashedPin) {
      this.isAuthenticated = true;
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    }
    return false;
  }

  logout() {
    this.isAuthenticated = false;
    localStorage.removeItem('isAuthenticated');
    this.router.navigate(['/landing']);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated || localStorage.getItem('isAuthenticated') === 'true';
  }

  private checkSession() {
    if (localStorage.getItem('isAuthenticated') === 'true') {
      this.isAuthenticated = true;
    }
  }

  private async hashPin(pin: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
