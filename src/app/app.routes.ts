import { Routes } from '@angular/router';
import { authGuard, guestGuard, adminGuard } from './auth/guards';
import { MainLayoutComponent } from './core/layout/main-layout.component';

export const routes: Routes = [
  // ── Auth (sin layout, acceso solo para guests) ──
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () =>
      import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // ── App (con layout, requiere autenticación) ──
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      // ── Módulos Base ──
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'movements',
        loadChildren: () =>
          import('./movements/movements.routes').then((m) => m.MOVEMENTS_ROUTES),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./reports/reports.routes').then((m) => m.REPORTS_ROUTES),
      },

      // ── Módulos Admin ──
      {
        path: 'products',
        canActivate: [adminGuard],
        loadChildren: () =>
          import('./products/products.routes').then((m) => m.PRODUCTS_ROUTES),
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadChildren: () =>
          import('./users/users.routes').then((m) => m.USERS_ROUTES),
      },
      {
        path: 'roles',
        canActivate: [adminGuard],
        loadChildren: () =>
          import('./roles/roles.routes').then((m) => m.ROLES_ROUTES),
      },
      {
        path: 'settings',
        canActivate: [adminGuard],
        loadChildren: () =>
          import('./settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
      },

      // ── Default redirect ──
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // ── Fallback ──
  { path: '**', redirectTo: 'auth/login' },
];
