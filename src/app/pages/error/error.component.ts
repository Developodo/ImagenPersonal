import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [MatButtonModule,FooterComponent],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css'
})
export class ErrorComponent {
  constructor(private router: Router) {
    localStorage.removeItem('searchTerm');
  }

  navigateHome() {
    this.router.navigate(['/']);
  }
}
