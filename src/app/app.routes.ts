// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './core/auth';
import { Router } from '@angular/router';

const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.loading()) {
    return new Promise<boolean>(resolve => {
      const interval = setInterval(() => {
        if (!auth.loading()) {
          clearInterval(interval);
          if (auth.isAuthenticated()) {
            resolve(true);
          } else {
            router.navigate(['/login']);
            resolve(false);
          }
        }
      }, 50);
    });
  }

  if (auth.isAuthenticated()) return true;
  router.navigate(['/login']);
  return false;
};

const loginGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    router.navigate(['/installation']);
    return false;
  }
  return true;
};

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'installation',
    pathMatch: 'full'
  },
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./core/login/login').then(m => m.Login)
  },
  {
    path: 'installation',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/installation/installation').then(m => m.Installation)
  }
];
