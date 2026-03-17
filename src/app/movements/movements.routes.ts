import { Routes } from '@angular/router';

export const MOVEMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/movements-page/movements-page.component').then(
        (m) => m.MovementsPageComponent
      ),
  },
];
