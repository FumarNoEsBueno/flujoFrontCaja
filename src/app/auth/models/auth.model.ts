// ─── Modelos que coinciden con la respuesta REAL del backend ──────────────────

/**
 * Datos del usuario tal como los retorna el backend (auth/me).
 * Los campos siguen la nomenclatura de la BD (usua_*, role_*).
 */
export interface Usuario {
  id: number;
  usua_nombre: string;
  usua_apellido_p: string;
  usua_apellido_m: string | null;
  usua_rut: string;
  usua_dv: string;
  usua_correo: string | null;
  usua_fecha_nac: string | null;
  role_id: number;
  rol: Rol;
}

export interface Rol {
  id: number;
  role_nombre: string;
}

/**
 * Respuesta completa del endpoint auth/me.
 * Separa datos del usuario y permisos en dos campos independientes.
 */
export interface MeResponse {
  usuario: Usuario;
  permisos: string[];
}

// ─── Auth Flow ───────────────────────────────────────────────────────────────

export interface LoginRequest {
  rut: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';
