import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
  withHooks,
} from '@ngrx/signals';

import type { AuthStatus, LoginResponse, MeResponse, Usuario } from '../models';
import { TokenService } from '../services';

// ─── State ───────────────────────────────────────────────────────────────────

export interface AuthState {
  usuario: Usuario | null;
  permisos: string[];
  status: AuthStatus;
  error: string | null;
}

const initialState: AuthState = {
  usuario: null,
  permisos: [],
  status: 'idle',
  error: null,
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const AuthStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((store) => ({
    isAuthenticated: computed(() => store.status() === 'authenticated'),
    isLoading: computed(() => store.status() === 'loading'),

    /** Nombre completo del usuario: "Manuel Pereira" */
    userName: computed(() => {
      const u = store.usuario();
      if (!u) return '';
      return [u.usua_nombre, u.usua_apellido_p, u.usua_apellido_m]
        .filter(Boolean)
        .join(' ');
    }),

    /** Nombre del rol: "Administrador" */
    userRole: computed(() => store.usuario()?.rol?.role_nombre ?? ''),

    /** Es Administrador */
    isAdmin: computed(() => {
      const rolNombre = store.usuario()?.rol?.role_nombre?.toLowerCase();
      return rolNombre === 'administrador';
    }),

    /** Lista de permisos como string[] */
    userPermissions: computed(() => store.permisos()),
  })),

  withMethods((store) => {
    const tokenService = inject(TokenService);

    return {
      setLoading(): void {
        patchState(store, { status: 'loading', error: null });
      },

      /**
       * Después de login exitoso: guarda token y marca como authenticated.
       * El usuario se cargará con setUserData() tras llamar a /auth/me.
       */
      setAuthenticated(response: LoginResponse): void {
        tokenService.setToken(response.access_token);
        patchState(store, {
          status: 'authenticated',
          error: null,
        });
      },

      /**
       * Recibe la respuesta de /auth/me y persiste usuario + permisos
       * tanto en el store como en localStorage.
       */
      setUserData(data: MeResponse): void {
        tokenService.setUserData(data.usuario);
        tokenService.setPermissions(data.permisos);
        patchState(store, {
          usuario: data.usuario,
          permisos: data.permisos,
          status: 'authenticated',
        });
      },

      setError(error: string): void {
        patchState(store, { status: 'error', error });
      },

      logout(): void {
        tokenService.clearAll();
        patchState(store, initialState);
      },

      /**
       * Verifica si el usuario tiene un permiso específico.
       * Los permisos son strings que representan vistas del frontend
       * (e.g. 'dashboard', 'usuarios', 'productos').
       */
      hasPermission(permiso: string): boolean {
        return store.permisos().includes(permiso);
      },
    };
  }),

  withHooks({
    onInit(store) {
      const tokenService = inject(TokenService);

      // Si hay token, rehidratar desde localStorage
      if (tokenService.hasToken()) {
        const usuario = tokenService.getUserData();
        const permisos = tokenService.getPermissions();

        if (usuario) {
          patchState(store, {
            usuario,
            permisos,
            status: 'authenticated',
          });
        } else {
          // Hay token pero no userData → marcar loading para que el guard deje pasar
          // y el componente pueda llamar a /auth/me
          patchState(store, { status: 'loading' });
        }
      }
    },
  }),
);
