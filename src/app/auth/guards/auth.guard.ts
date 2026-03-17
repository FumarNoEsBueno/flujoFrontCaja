import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthStore } from '../store';
import { TokenService } from '../services';

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

export const guestGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};

export const adminGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAdmin()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
