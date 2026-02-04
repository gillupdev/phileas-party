import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./app').then(m => m.App),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
