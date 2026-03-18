import {
  Component,
  inject,
  output,
  signal,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { injectQuery } from '@tanstack/angular-query-experimental';

import { MovimientoService } from '../../services/movimiento.service';
import { CajaService } from '../../services/caja.service';
import { AuthStore } from '../../../auth/store/auth.store';
import type {
  CajaAutocomplete,
  Movimiento,
  MovimientoFilters,
} from '../../models';
import {
  ButtonComponent,
  CardComponent,
  CustomTableComponent,
} from '../../../shared/components';
import type { TableColumn, TableAction } from '../../../shared/components';
import { CustomAutocompleteComponent } from '../.././../shared/components/autocomplete/custom-autocomplete.component';
import type { AutocompleteOption } from '../../../shared/components/autocomplete/custom-autocomplete.component';

@Component({
  selector: 'app-movements-list',
  standalone: true,
  imports: [
    FormsModule,
    CardComponent,
    ButtonComponent,
    CustomTableComponent,
    CustomAutocompleteComponent,
  ],
  template: `
    <!-- ─── Filtros ─────────────────────────────────────────────────── -->
    <app-card class="mb-6 block">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">

        <!-- ID Transacción -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-surface-600 uppercase tracking-wide">
            ID Transacción
          </label>
          <input
            type="text"
            placeholder="UUID de la transacción..."
            [(ngModel)]="filtroTransaccion"
            class="px-3.5 py-2.5 bg-white border border-surface-300 rounded-lg text-surface-900
                   placeholder:text-surface-400 text-sm focus:outline-none focus:ring-2
                   focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>

        <!-- Caja (autocomplete) -->
        <app-custom-autocomplete
          label="Caja"
          placeholder="Todas las cajas..."
          [options]="cajasComoOpciones()"
          [(ngModel)]="filtroCaja"
          name="filtroCaja"
        />

        <!-- Fecha de movimiento -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-surface-600 uppercase tracking-wide">
            Fecha de movimiento
          </label>
          <input
            type="date"
            [(ngModel)]="filtroFecha"
            class="px-3.5 py-2.5 bg-white border border-surface-300 rounded-lg text-surface-900
                   text-sm focus:outline-none focus:ring-2 focus:ring-primary-500
                   focus:border-primary-500 transition-colors"
          />
        </div>

        <!-- Mis ingresados -->
        <div class="flex flex-col gap-1 justify-end">
          <label class="flex items-center gap-2.5 cursor-pointer select-none py-2.5">
            <input
              type="checkbox"
              [(ngModel)]="filtroMisIngresados"
              class="w-4 h-4 rounded border-surface-300 text-primary-600
                     focus:ring-primary-500 cursor-pointer"
            />
            <span class="text-sm text-surface-700 font-medium">Solo mis ingresados</span>
          </label>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex items-center justify-between pt-2 border-t border-surface-100">
        <app-button variant="ghost" size="sm" (onClick)="limpiarFiltros()">
          Limpiar filtros
        </app-button>
        <div class="flex gap-3">
          <app-button variant="primary" size="md" (onClick)="filtrar()">
            Filtrar
          </app-button>
          <app-button variant="outline" size="md" (onClick)="onNuevoMovimiento()">
            + Nuevo
          </app-button>
        </div>
      </div>
    </app-card>

    <!-- ─── Resultados ───────────────────────────────────────────────── -->
    @if (haFiltrado()) {
      <app-custom-table
        [columns]="columnas"
        [rows]="movimientos()"
        [loading]="movimientosQuery.isPending()"
        [error]="movimientosQuery.isError() ? 'Error al cargar los movimientos' : null"
        [pagination]="paginacion()"
        [actions]="acciones"
        emptyIcon="💰"
        emptyTitle="Sin movimientos"
        emptyMessage="No se encontraron movimientos con los filtros aplicados."
        (prevPage)="irPagina(paginaActual() - 1)"
        (nextPage)="irPagina(paginaActual() + 1)"
        (actionClick)="onAccion($event)"
      />
    } @else {
      <div class="flex flex-col items-center justify-center py-20 text-surface-400">
        <span class="text-6xl mb-4">🔍</span>
        <p class="text-lg font-medium text-surface-600 mb-1">
          Aplicá los filtros para ver movimientos
        </p>
        <p class="text-sm">
          Completá los criterios y presioná <strong class="text-surface-700">Filtrar</strong>.
        </p>
      </div>
    }
  `,
})
export class MovementsListComponent {
  private readonly movimientoService = inject(MovimientoService);
  private readonly cajaService       = inject(CajaService);
  private readonly authStore         = inject(AuthStore);

  // ─── Outputs ───────────────────────────────────────────────────────────────

  nuevoMovimiento = output<{ cajas: CajaAutocomplete[] }>();
  verDetalle      = output<Movimiento>();
  eliminar        = output<Movimiento>();

  // ─── Filtros (estado del formulario) ──────────────────────────────────────

  filtroTransaccion   = '';
  filtroFecha         = '';
  filtroMisIngresados = false;

  /** Signal interno para el filtro de caja — necesario para que [(ngModel)] notifique al CVA al limpiar */
  private _filtroCaja = signal<AutocompleteOption | null>(null);
  get filtroCaja(): AutocompleteOption | null { return this._filtroCaja(); }
  set filtroCaja(value: AutocompleteOption | null) { this._filtroCaja.set(value); }

  // ─── Estado de búsqueda ───────────────────────────────────────────────────

  haFiltrado       = signal(false);
  paginaActual     = signal(1);
  filtrosAplicados = signal<MovimientoFilters>({});
  /** Incrementa cada vez que el usuario presiona Filtrar — fuerza re-fetch aunque los filtros no cambien */
  filtrarVersion   = signal(0);

  // ─── Query de cajas (autocomplete) ────────────────────────────────────────

  cajasQuery = injectQuery(() => ({
    queryKey: ['cajas-autocomplete'],
    queryFn: () =>
      this.cajaService.autocomplete().toPromise().then((r) => r!),
  }));

  cajasAutocomplete = computed(
    () => this.cajasQuery.data()?.data ?? [],
  );

  cajasComoOpciones = computed(
    () => this.cajasAutocomplete().map((c) => ({ id: c.id, label: c.label })),
  );

  // ─── Query de movimientos ──────────────────────────────────────────────────

  movimientosQuery = injectQuery(() => ({
    queryKey: ['movimientos', this.filtrosAplicados(), this.paginaActual(), this.filtrarVersion()],
    queryFn: () =>
      this.movimientoService
        .getAll(this.filtrosAplicados(), this.paginaActual())
        .toPromise()
        .then((r) => r!),
    enabled: this.haFiltrado(),
  }));

  movimientos = computed(
    () =>
      ((this.movimientosQuery.data()?.data ?? []) as unknown) as Record<string, unknown>[],
  );

  paginacion = computed(() => {
    const meta = this.movimientosQuery.data()?.meta;
    if (!meta) return null;
    return { currentPage: meta.current_page, hasMore: meta.has_more };
  });

  // ─── Definición de columnas ───────────────────────────────────────────────

  readonly columnas: TableColumn[] = [
    {
      key: 'descripcion',
      label: 'Descripción',
      cellClass: 'font-medium text-surface-900',
    },
    {
      key: 'fechaIngreso',
      label: 'Fecha',
      cellClass: 'text-surface-600',
    },
    {
      key: 'montoTotal',
      label: 'Monto',
      cellClass: 'font-semibold text-surface-900',
      format: (v) => `$ ${v}`,
    },
    {
      key: 'medioPago',
      label: 'Medio de pago',
    },
    {
      key: 'caja',
      label: 'Caja',
      cellClass: 'text-surface-600',
    },
    {
      key: 'usuario',
      label: 'Ingresado por',
      cellClass: 'text-surface-600',
    },
    {
      key: 'idTransaccion',
      label: 'ID Transacción',
      cellClass: 'font-mono text-xs text-surface-500 max-w-[140px] truncate',
    },
  ];

  // ─── Acciones de la tabla ─────────────────────────────────────────────────

  readonly acciones: TableAction[] = [
    { label: 'Ver', variant: 'ghost' },
    { label: 'Eliminar', variant: 'danger' },
  ];

  // ─── Handlers ─────────────────────────────────────────────────────────────

  filtrar(): void {
    const filters: MovimientoFilters = {};

    if (this.filtroTransaccion.trim()) {
      filters.movi_id_transaccion = this.filtroTransaccion.trim();
    }
    if (this._filtroCaja()) {
      filters.caja_id = Number(this._filtroCaja()!.id);
    }
    if (this.filtroFecha) {
      filters.movi_fecha_ingreso = this.filtroFecha;
    }
    if (this.filtroMisIngresados) {
      const usuaId = this.authStore.usuario()?.id;
      if (usuaId) filters.usua_id = usuaId;
    }

    this.filtrosAplicados.set(filters);
    this.paginaActual.set(1);
    this.filtrarVersion.update((v) => v + 1);
    this.haFiltrado.set(true);
  }

  limpiarFiltros(): void {
    this.filtroTransaccion   = '';
    this._filtroCaja.set(null);
    this.filtroFecha         = '';
    this.filtroMisIngresados = false;
    this.filtrosAplicados.set({});
    this.paginaActual.set(1);
    this.filtrarVersion.set(0);
    this.haFiltrado.set(false);
  }

  irPagina(pagina: number): void {
    this.paginaActual.set(pagina);
  }

  onNuevoMovimiento(): void {
    this.nuevoMovimiento.emit({ cajas: this.cajasAutocomplete() });
  }

  onAccion(event: { action: string; row: Record<string, unknown> }): void {
    const movimiento = event.row as unknown as Movimiento;
    if (event.action === 'Ver') {
      this.verDetalle.emit(movimiento);
    } else if (event.action === 'Eliminar') {
      this.eliminar.emit(movimiento);
    }
  }
}
