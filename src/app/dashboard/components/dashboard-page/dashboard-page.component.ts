import { Component } from '@angular/core';
import { PageHeaderComponent, CardComponent } from '../../../shared/components';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [PageHeaderComponent, CardComponent],
  template: `
    <app-page-header
      title="Dashboard"
      subtitle="Resumen general del sistema de cajas"
    />

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <app-card>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-surface-500">Ventas Hoy</p>
            <p class="text-2xl font-bold text-surface-900 mt-1">$0.00</p>
          </div>
          <div class="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
            <span class="text-2xl">💵</span>
          </div>
        </div>
      </app-card>

      <app-card>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-surface-500">Movimientos</p>
            <p class="text-2xl font-bold text-surface-900 mt-1">0</p>
          </div>
          <div class="w-12 h-12 bg-info-50 rounded-xl flex items-center justify-center">
            <span class="text-2xl">📊</span>
          </div>
        </div>
      </app-card>

      <app-card>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-surface-500">Caja Actual</p>
            <p class="text-2xl font-bold text-surface-900 mt-1">$0.00</p>
          </div>
          <div class="w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center">
            <span class="text-2xl">🏦</span>
          </div>
        </div>
      </app-card>

      <app-card>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-surface-500">Productos</p>
            <p class="text-2xl font-bold text-surface-900 mt-1">0</p>
          </div>
          <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
            <span class="text-2xl">📦</span>
          </div>
        </div>
      </app-card>
    </div>

    <!-- Placeholder Areas -->
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
export class DashboardPageComponent {}
