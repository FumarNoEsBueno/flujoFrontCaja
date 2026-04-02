// ─── Usuario (tabla) ─────────────────────────────────────────────────────────

/** Forma aplanada que devuelve el endpoint /users/table */
export interface UsuarioTabla {
  id: number;
  nombre: string;       // 'Manuel Pereira Opazo' (concatenado por el Resource)
  rut: string;          // '20194802-9' (formateado por el Resource)
  correo: string | null;
  rolNombre: string;    // 'Administrador'
  roleId: number;
  totalCajas: number;
}

// ─── Usuario (detalle / show) ─────────────────────────────────────────────────

/** Forma completa que devuelve el endpoint GET /users/{id} */
export interface UsuarioDetalle {
  id: number;
  nombre: string;
  apellidoP: string;
  apellidoM: string | null;
  rut: string;           // '20194802-9' (RUT completo con DV)
  correo: string | null;
  fechaNac: string;      // 'YYYY-MM-DD'
  rolNombre: string;
  roleId: number;
  cajas: UsuarioCaja[];
}

// ─── Caja del usuario ─────────────────────────────────────────────────────────

export interface UsuarioCaja {
  id: number;           // id de usuarios_por_caja
  cajaId: number;
  cajaNombre: string;
  localNombre: string;
  habilitado: boolean;
  fechaInicio: string | null;
}

// ─── Payloads ────────────────────────────────────────────────────────────────

export interface CreateUsuarioPayload {
  usua_nombre: string;
  usua_apellido_p: string;
  usua_apellido_m?: string | null;
  usua_rut: string;          // RUT completo con formato "20194802-9"
  usua_correo?: string | null;
  usua_fecha_nac: string;    // 'YYYY-MM-DD'
  usua_password: string;
  role_id: number;
}

export interface UpdateUsuarioPayload {
  usua_nombre?: string;
  usua_apellido_p?: string;
  usua_apellido_m?: string | null;
  usua_rut?: string;         // RUT completo con formato "20194802-9"
  usua_correo?: string | null;
  usua_fecha_nac?: string;
  usua_password?: string;
  role_id?: number;
}

export interface AsignarCajaPayload {
  caja_id: number;
  usca_habilitado?: boolean;
  usca_fecha_inicio?: string;
}

// ─── Rol (para autocomplete) ──────────────────────────────────────────────────

export interface RolOption {
  id: number;
  nombre: string;
}
