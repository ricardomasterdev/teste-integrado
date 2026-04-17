import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./features/layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'beneficios',
        loadComponent: () => import('./features/beneficios/beneficios-list.component').then(m => m.BeneficiosListComponent)
      },
      {
        path: 'transferencias',
        loadComponent: () => import('./features/transferencias/transferencias-list.component').then(m => m.TransferenciasListComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/sistema/usuarios/usuarios-list.component').then(m => m.UsuariosListComponent)
      },
      {
        path: 'logs',
        loadComponent: () => import('./features/sistema/logs/logs-list.component').then(m => m.LogsListComponent)
      }
    ]
  },
  { path: '', pathMatch: 'full', redirectTo: 'app' },
  { path: '**', redirectTo: 'app' }
];
