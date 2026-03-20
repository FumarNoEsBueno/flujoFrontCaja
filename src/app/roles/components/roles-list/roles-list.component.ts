import { Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';

import { RolService } from '../../services/rol.service';
import type { RolFilters } from '../../services/rol.service';
import type { RolTabla } from '../../models';
import {
  ButtonComponent,
  CardComponent,
  CustomTableComponent,
} from '../../../shared/components';
import type { TableAction, TableColumn } from '../../../shared/components';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [FormsModule, CardComponent, ButtonComponent, CustomTableComponent],
  template: `
    <!-- ─── Filtros ─────────────────────────────────────────────────── -->
    <app-card class="mb-6 block">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

        <!-- Nombre -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-surface-600 uppercase tracking-wide">
            Nombre
          </label>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            [(ngModel)]="filtroNombre"
            class="px-3.5 py-2.5 bg-white border border-surface-300 rounded-lg text-surface-900
                   placeholder:text-surface-400 text-sm focus:outline-none focus:ring-2
                   focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>

      </div>

      <!-- Botones de acción -->
      <div class="flex items-center justify-between pt-2 border-t border-surface-100">
        <app-button variant="ghost" size="sm" (onClick)="limpiarFiltros()">
          Limpiar filtros
        </app-button>
        <app-button variant="primary" size="md" (onClick)="buscar()">
          Buscar
        </app-button>
      </div>
    </app-card>

    <!-- ─── Tabla ─────────────────────────────────────────────────────── -->
    <app-custom-table
      [columns]="columnas"
      [rows]="roles()"
      [loading]="rolesQuery.isPending()"
      [error]="rolesQuery.isError() ? 'Error al cargar los roles' : null"
      [pagination]="paginacion()"
      [actions]="acciones"
      emptyIcon="🔑"
      emptyTitle="Sin roles"
      emptyMessage="No se encontraron roles con los filtros aplicados."
      (prevPage)="irPagina(paginaActual() - 1)"
      (nextPage)="irPagina(paginaActual() + 1)"
      (actionClick)="onAccion($event)"
    />
  `,
})
export class RolesListComponent {
  private readonly rolService = inject(RolService);

  // ─── Outputs ─────────────────────────────────────────────────────────────

  editar   = output<RolTabla>();
  eliminar = output<RolTabla>();

  // ─── Filtros (estado del formulario) ─────────────────────────────────────

  filtroNombre = '';

  // ─── Estado de búsqueda ───────────────────────────────────────────────────

  paginaActual     = signal(1);
  filtrosAplicados = signal<RolFilters>({});
  buscarVersion    = signal(0);

  // ─── Queries ─────────────────────────────────────────────────────────────

  rolesQuery = injectQuery(() => ({
    queryKey: ['roles', this.filtrosAplicados(), this.paginaActual(), this.buscarVersion()],
    queryFn: () =>
      firstValueFrom(this.rolService.getAll(this.filtrosAplicados(), this.paginaActual())),
  }));

  roles = computed(
    () => ((this.rolesQuery.data()?.data ?? []) as unknown) as Record<string, unknown>[],
  );

  paginacion = computed(() => {
    const meta = this.rolesQuery.data()?.meta;
    if (!meta) return null;
    return { currentPage: meta.current_page, hasMore: meta.has_more };
  });

  // ─── Columnas ─────────────────────────────────────────────────────────────

  readonly columnas: TableColumn[] = [
    { key: 'nombre', label: 'Nombre', cellClass: 'font-medium text-surface-900' },
    {
      key: 'permisos',
      label: 'Permisos',
      format: (v) => {
        const permisos = v as Array<{ id: number; nombre: string }>;
        if (!permisos?.length) return 'Sin permisos';
        return `${permisos.length} permiso${permisos.length !== 1 ? 's' : ''}`;
      },
    },
  ];

  // ─── Acciones ─────────────────────────────────────────────────────────────

  readonly acciones: TableAction[] = [
    { label: 'Editar',   variant: 'outline' },
    { label: 'Eliminar', variant: 'danger' },
  ];

  // ─── Handlers ─────────────────────────────────────────────────────────────

  buscar(): void {
    const filters: RolFilters = {};

    if (this.filtroNombre.trim()) {
      filters.nombre = this.filtroNombre.trim();
    }

    this.filtrosAplicados.set(filters);
    this.paginaActual.set(1);
    this.buscarVersion.update((v) => v + 1);
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtrosAplicados.set({});
    this.paginaActual.set(1);
    this.buscarVersion.set(0);
  }

  irPagina(pagina: number): void {
    this.paginaActual.set(pagina);
  }

  onAccion(event: { action: string; row: Record<string, unknown> }): void {
    const rol = event.row as unknown as RolTabla;
    if (event.action === 'Editar') {
      this.editar.emit(rol);
    } else if (event.action === 'Eliminar') {
      this.eliminar.emit(rol);
    }
  }
}
