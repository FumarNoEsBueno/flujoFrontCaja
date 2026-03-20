// ─── Permiso ──────────────────────────────────────────────────────────────────

export interface PermisoOption {
  id: number;
  nombre: string;
}

// ─── Rol (tabla) ──────────────────────────────────────────────────────────────

/** Forma aplanada que devuelve el endpoint /roles/table */
export interface RolTabla {
  id: number;
  nombre: string;
  permisos: PermisoOption[];
  /** Solo presente en el endpoint GET /roles/{id} */
  todos_los_permisos?: PermisoOption[];
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateRolPayload {
  role_nombre: string;
  perm_ids: number[];
}

export interface UpdateRolPayload {
  role_nombre: string;
  perm_ids: number[];
}
