// ─── Caja ─────────────────────────────────────────────────────────────────────

export interface CajaLocal {
  id: number;
  nombre: string;
  direccion: string | null;
}

export interface Caja {
  id: number;
  nombre: string;
  local: CajaLocal | null;
}

/** Forma simplificada para autocomplete */
export interface CajaAutocomplete {
  id: number;
  label: string;
}

// ─── Producto ─────────────────────────────────────────────────────────────────

/** Respuesta del endpoint GET /productos/autocomplete */
export interface ProductoAutocomplete {
  id: number;
  label: string;
  precio: string;
}

/** Item interno del selector de productos (incluye cantidad elegida por el user) */
export interface ProductoLineaItem {
  prod_id: number;
  label: string;
  precio: string;
  cantidad: number;
}

// ─── Movimiento ───────────────────────────────────────────────────────────────

/** Producto aplanado dentro del detalle de un movimiento */
export interface ProductoDelMovimiento {
  id: number;
  nombre: string | null;
  cantidad: number;
  montoUnitario: string;
}

export interface VerificacionMontos {
  aplica: boolean;
  coincide: boolean;
  montoDeclarado: string;
  montoProductos: string;
  motivos: string[];
}

export interface Movimiento {
  id: number;
  descripcion: string;
  fechaIngreso: string;
  idTransaccion: string;
  montoTotal: string;
  medioPago: string;
  propina: string | null;
  tipoMovimiento: string | null;
  usuario: string | null;
  caja: string | null;
  productos: ProductoDelMovimiento[];
  verificacion: VerificacionMontos;
}

// ─── Request / Filters ───────────────────────────────────────────────────────

export interface CreateMovimientoRequest {
  movi_descripcion: string;
  movi_fecha_ingreso: string; // YYYY-MM-DD
  movi_monto_total: string;
  movi_medio_pago: string;
  movi_propina?: string | null;
  caja_id: number;
  productos?: Array<{ prod_id: number; pdmo_cantidad: number }>;
}

/** Same as CreateMovimientoRequest but WITHOUT caja_id (caja cannot be edited) */
export interface UpdateMovimientoRequest {
  movi_descripcion: string;
  movi_fecha_ingreso: string; // YYYY-MM-DD
  movi_monto_total: string;
  movi_medio_pago: string;
  movi_propina?: string | null;
  productos?: Array<{ prod_id: number; pdmo_cantidad: number }>;
}

export interface MovimientoFilters {
  movi_id_transaccion?: string;
  caja_id?: number;
  usua_id?: number;
  movi_fecha_ingreso?: string; // YYYY-MM-DD
}

// ─── Paginación simplePaginate ────────────────────────────────────────────────

export interface SimplePaginateMeta {
  current_page: number;
  per_page: number;
  has_more: boolean;
  next_page_url: string | null;
}

export interface SimplePaginatedResponse<T> {
  data: T[];
  meta: SimplePaginateMeta;
  message: string;
  success: boolean;
}
