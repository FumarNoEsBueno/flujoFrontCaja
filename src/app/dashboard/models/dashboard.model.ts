export interface DashboardCaja {
  cajaId: number;
  cajaNombre: string;
  localNombre: string;
  totalMovimientos: number;
  montoTotal: number;
}

export interface DashboardProducto {
  prodId: number;
  prodNombre: string;
  totalVendido: number;
}

export interface DashboardData {
  ventasHoy: number;
  cajas: DashboardCaja[];
  productosDia: DashboardProducto[];
}
