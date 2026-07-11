import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'discover', loadComponent: () => import('./features/discover/discover.component').then(m => m.DiscoverComponent), canActivate: [authGuard] },
  { path: 'history', loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' }
];
