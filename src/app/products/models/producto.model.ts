// ─── Producto (tabla) ─────────────────────────────────────────────────────────

/** Forma aplanada que devuelve el endpoint /productos/table */
export interface ProductoTabla {
  id: number;
  nombre: string;
  precio: number;
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateProductoPayload {
  prod_nombre: string;
  prod_precio: number;
}

export interface UpdateProductoPayload {
  prod_nombre: string;
  prod_precio: number;
}
