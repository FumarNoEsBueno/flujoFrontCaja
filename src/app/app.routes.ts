import { Routes } from '@angular/router';
import { authGuard, guestGuard, permissionGuard } from './auth/guards';
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
        canActivate: [permissionGuard],
        data: { permiso: 'dashboard' },
        loadChildren: () =>
          import('./dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'movements',
        canActivate: [permissionGuard],
        data: { permiso: 'movimientos' },
        loadChildren: () =>
          import('./movements/movements.routes').then((m) => m.MOVEMENTS_ROUTES),
      },
      {
        path: 'reports',
        canActivate: [permissionGuard],
        data: { permiso: 'reportes' },
        loadChildren: () =>
          import('./reports/reports.routes').then((m) => m.REPORTS_ROUTES),
      },

      // ── Módulos Admin (protegidos por permiso específico) ──
      {
        path: 'products',
        canActivate: [permissionGuard],
        data: { permiso: 'productos' },
        loadChildren: () =>
          import('./products/products.routes').then((m) => m.PRODUCTS_ROUTES),
      },
      {
        path: 'users',
        canActivate: [permissionGuard],
        data: { permiso: 'usuarios' },
        loadChildren: () =>
          import('./users/users.routes').then((m) => m.USERS_ROUTES),
      },
      {
        path: 'roles',
        canActivate: [permissionGuard],
        data: { permiso: 'roles' },
        loadChildren: () =>
          import('./roles/roles.routes').then((m) => m.ROLES_ROUTES),
      },
      {
        path: 'settings',
        canActivate: [permissionGuard],
        data: { permiso: 'roles' },
        loadChildren: () =>
          import('./settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
      },

      // ── Default redirect ──
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // ── Perfil (sin permissionGuard — cualquier usuario autenticado) ──
      {
        path: 'perfil',
        loadChildren: () =>
          import('./perfil/perfil.routes').then((m) => m.PERFIL_ROUTES),
      },
    ],
  },

  // ── Fallback ──
  { path: '**', redirectTo: 'auth/login' },
];
