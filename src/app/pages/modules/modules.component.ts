import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Modules } from '../../data/modules';
import { FooterComponent } from '../../components/footer/footer.component';


@Component({
  selector: 'app-modules',
  standalone: true,
  imports: [NavbarComponent,RouterLink,FooterComponent],
  templateUrl: './modules.component.html',
  styleUrl: './modules.component.css'
})
export class ModulesComponent {
  modules = Modules.modules;
  
  constructor(){
    localStorage.removeItem('searchTerm');
  }
  
}
