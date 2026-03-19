import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';

import { PageHeaderComponent, CardComponent, RotatingCardComponent } from '../../../shared/components';
import type { RotatingItem } from '../../../shared/components';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [PageHeaderComponent, CardComponent, RotatingCardComponent],
  template: `
    <app-page-header
      title="Dashboard"
      subtitle="Resumen general del sistema de cajas"
    />

    <!-- ─── KPI Cards ──────────────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

      <!-- Ventas Hoy (estática, suma total) -->
      <app-card>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-surface-500">Ventas Hoy</p>
            @if (dashboardQuery.isPending()) {
              <div class="h-8 w-24 bg-surface-100 rounded animate-pulse mt-1"></div>
            } @else {
              <p class="text-2xl font-bold text-surface-900 mt-1">
                {{ ventasHoyFormateadas() }}
              </p>
            }
            <p class="text-xs text-surface-400 mt-0.5">Total movimientos del día</p>
          </div>
          <div class="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <span class="text-2xl">💵</span>
          </div>
        </div>
      </app-card>

      <!-- Movimientos por Caja (rotativa) -->
      <app-rotating-card
        title="Movimientos"
        icon="📊"
        iconBgClass="bg-info-50"
        iconTitle="Ir a movimientos de esta caja"
        [items]="itemsMovimientos()"
        [intervalMs]="3000"
        (iconClicked)="irAMovimientosDeCaja($event)"
      />

      <!-- Caja Actual — monto acumulado total por caja (rotativa) -->
      <app-rotating-card
        title="Caja Actual"
        icon="🏦"
        iconBgClass="bg-warning-50"
        iconTitle="Ir a movimientos de esta caja"
        [items]="itemsCajas()"
        [intervalMs]="3000"
        (iconClicked)="irAMovimientosDeCaja($event)"
      />

      <!-- Productos vendidos hoy (rotativa) -->
      <app-rotating-card
        title="Productos Hoy"
        icon="📦"
        iconBgClass="bg-primary-50"
        iconTitle="Producto vendido hoy"
        [items]="itemsProductos()"
        [intervalMs]="3000"
      />

    </div>

    <!-- ─── Placeholder Areas ──────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <app-card title="Últimos Movimientos" [divider]="true" class="lg:col-span-2">
        <div class="flex items-center justify-center py-12 text-surface-400">
          <p class="text-sm">Los movimientos recientes aparecerán aquí</p>
        </div>
      </app-card>

      <app-card title="Actividad Reciente" [divider]="true">
        <div class="flex items-center justify-center py-12 text-surface-400">
          <p class="text-sm">La actividad aparecerá aquí</p>
        </div>
      </app-card>
    </div>
  `,
})
export class DashboardPageComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);

  // ─── Query ───────────────────────────────────────────────────────────────────
  dashboardQuery = injectQuery(() => ({
    queryKey: ['dashboard-data'],
    queryFn: () => firstValueFrom(this.dashboardService.getDashboardData()),
    staleTime: 1000 * 60 * 2, // 2 minutos
  }));

  private data = computed(() => this.dashboardQuery.data()?.data ?? null);

  // ─── Ventas Hoy ──────────────────────────────────────────────────────────────
  ventasHoyFormateadas = computed(() => {
    const v = this.data()?.ventasHoy ?? 0;
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(v);
  });

  // ─── Items para card de Movimientos ──────────────────────────────────────────
  itemsMovimientos = computed<RotatingItem[]>(() => {
    const cajas = this.data()?.cajas ?? [];
    if (!cajas.length) {
      return [{ id: 0, label: 'Sin cajas', value: '0', sublabel: 'No hay cajas asignadas' }];
    }
    return cajas.map((c) => ({
      id: c.cajaId,
      label: c.cajaNombre,
      sublabel: `${c.cajaNombre} — ${c.localNombre}`,
      value: c.totalMovimientos.toString(),
      badgeLabel: 'mov. hoy',
    }));
  });

  // ─── Items para card de Caja Actual ──────────────────────────────────────────
  itemsCajas = computed<RotatingItem[]>(() => {
    const cajas = this.data()?.cajas ?? [];
    if (!cajas.length) {
      return [{ id: 0, label: 'Sin cajas', value: '$0', sublabel: 'No hay cajas asignadas' }];
    }
    return cajas.map((c) => ({
      id: c.cajaId,
      label: c.cajaNombre,
      sublabel: `${c.cajaNombre} — ${c.localNombre}`,
      value: new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
      }).format(c.montoTotal),
    }));
  });

  // ─── Items para card de Productos ────────────────────────────────────────────
  itemsProductos = computed<RotatingItem[]>(() => {
    const productos = this.data()?.productosDia ?? [];
    if (!productos.length) {
      return [{ id: 0, label: 'Sin ventas', value: '0 uds.', sublabel: 'Sin productos vendidos hoy' }];
    }
    return productos.map((p) => ({
      id: p.prodId,
      label: p.prodNombre,
      sublabel: p.prodNombre,
      value: `${p.totalVendido} uds.`,
    }));
  });

  // ─── Navegación a Movimientos con filtro de caja preseleccionado ─────────────
  irAMovimientosDeCaja(item: RotatingItem | null): void {
    if (!item || item.id === 0) return;
    this.router.navigate(['/movements'], {
      state: {
        cajaId: item.id,
        cajaNombre: item.label,
      },
    });
  }
}
