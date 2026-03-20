// ─── Respuesta del UsuarioResource (GET /perfil, PATCH /perfil/correo) ───────

export interface PerfilData {
  id: number;
  nombre: string;      // nombre completo formateado por el backend
  rut: string;         // "usua_rut-usua_dv" formateado por el backend
  correo: string;
  rolNombre: string | null;
  roleId: number;
  totalCajas: number | null;
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface UpdateCorreoPayload {
  usua_correo: string;
}

export interface UpdatePasswordPayload {
  password_actual: string;
  password_nuevo: string;
  password_nuevo_confirmation: string;
}
