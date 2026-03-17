import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/products-page/products-page.component').then(
        (m) => m.ProductsPageComponent
      ),
  },
];
