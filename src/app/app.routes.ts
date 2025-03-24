import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { exitGuard } from './guards/exit.guard';

export const routes: Routes = [
    { path: 'landing', loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent) },
    { path: 'modules', loadComponent: () => import('./pages/modules/modules.component').then(m => m.ModulesComponent), canActivate: [authGuard] },
    { path: 'clients/:moduleName', loadComponent: () => import('./pages/clients/clients.component').then(m => m.ClientsComponent), canActivate: [authGuard] },
    { path: 'client/:moduleName/:id', loadComponent: () => import('./pages/client/client.component').then(m => m.ClientComponent), canActivate: [authGuard] ,canDeactivate:[exitGuard]},
    { path: 'calendar', loadComponent: () => import('./pages/calendar/calendar.component').then(m => m.CalendarComponent), canActivate: [authGuard] },
    { path: 'timetable', loadComponent: () => import('./pages/timetable/timetable.component').then(m => m.TimetableComponent), canActivate: [authGuard] },
    { path: 'error', loadComponent: () => import('./pages/error/error.component').then(m => m.ErrorComponent) },
    { path: 'stats', loadComponent: () => import('./components/stats/stats.component').then(m => m.StatsComponent) , canActivate: [authGuard]},
    { path: '', redirectTo: 'landing', pathMatch: 'full' },
    { path: '**', redirectTo: 'error' }
  ];
