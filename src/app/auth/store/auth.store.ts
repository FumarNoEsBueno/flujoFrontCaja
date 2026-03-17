import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
  withHooks,
} from '@ngrx/signals';

import { AuthStatus, LoginResponse, User } from '../models';
import { TokenService } from '../services';

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((store) => ({
    isAuthenticated: computed(() => store.status() === 'authenticated'),
    isLoading: computed(() => store.status() === 'loading'),
    userName: computed(() => store.user()?.name ?? ''),
    userRole: computed(() => store.user()?.role?.name ?? ''),
    isAdmin: computed(() => {
      const role = store.user()?.role?.name;
      return role === 'admin' || role === 'superadmin';
    }),
    userPermissions: computed(() => store.user()?.role?.permissions ?? []),
  })),

  withMethods((store) => {
    const tokenService = inject(TokenService);

    return {
      setLoading(): void {
        patchState(store, { status: 'loading', error: null });
      },

      setAuthenticated(response: LoginResponse): void {
        tokenService.setToken(response.access_token);
        patchState(store, {
          status: 'authenticated',
          error: null,
        });
      },

      setUser(user: User): void {
        patchState(store, { user, status: 'authenticated' });
      },

      setError(error: string): void {
        patchState(store, { status: 'error', error });
      },

      logout(): void {
        tokenService.clearToken();
        patchState(store, initialState);
      },

      hasPermission(resource: string, action: string): boolean {
        const permissions = store.user()?.role?.permissions ?? [];
        return permissions.some((p) => p.resource === resource && p.action === (action as any));
      },
    };
  }),

  withHooks({
    onInit(store) {
      const tokenService = inject(TokenService);
      if (tokenService.hasToken()) {
        patchState(store, { status: 'loading' });
      }
    },
  }),
);
