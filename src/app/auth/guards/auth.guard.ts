import { inject } from '@angular/core';
import { Router, type CanActivateFn, type ActivatedRouteSnapshot } from '@angular/router';
import { AuthStore } from '../store';
import { TokenService } from '../services';

/**
 * Permite el acceso si el usuario está autenticado (tiene token).
 * Si hay userData en localStorage, la rehidrata automáticamente.
 */
export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (authStore.isAuthenticated() || tokenService.hasToken()) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};

/**
 * Solo permite el acceso a usuarios NO autenticados (login page).
 */
export const guestGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (authStore.isAuthenticated() || tokenService.hasToken()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};

/**
 * Permite acceso solo a Administradores.
 */
export const adminGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAdmin()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

/**
 * Guard basado en permisos del rol.
 * Verifica que el usuario tenga el permiso requerido en la ruta.
 *
 * Uso en rutas:
 * ```ts
 * {
 *   path: 'productos',
 *   canActivate: [permissionGuard],
 *   data: { permiso: 'productos' },
 *   loadChildren: () => ...
 * }
 * ```
 */
export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const permiso = route.data?.['permiso'] as string | undefined;

  // Si no se definió permiso en la ruta, dejamos pasar
  if (!permiso) {
    return true;
  }

  if (authStore.hasPermission(permiso)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
