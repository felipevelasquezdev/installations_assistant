// src/app/app.routes.ts

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'installation',
    pathMatch: 'full'
  },
  {
    path: 'installation',
    loadComponent: () =>
      import('./features/installation/installation')
        .then(m => m.Installation)
  }
];
