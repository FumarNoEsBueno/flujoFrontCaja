import { Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';

import { UsuarioService } from '../../services/usuario.service';
import type { UsuarioFilters } from '../../services/usuario.service';
import { RolService } from '../../services/rol.service';
import type { UsuarioTabla } from '../../models';
import {
  ButtonComponent,
  CardComponent,
  CustomTableComponent,
  ToastService,
} from '../../../shared/components';
import type { TableAction, TableColumn, ExcelConfig } from '../../../shared/components';
import { CustomAutocompleteComponent } from '../../../shared/components/autocomplete/custom-autocomplete.component';
import type { AutocompleteOption } from '../../../shared/components';

@Component({
  selector: 'app-users-list',
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
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">

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

        <!-- RUT -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-surface-600 uppercase tracking-wide">
            RUT
          </label>
          <input
            type="text"
            placeholder="Ej: 20194802"
            [(ngModel)]="filtroRut"
            class="px-3.5 py-2.5 bg-white border border-surface-300 rounded-lg text-surface-900
                   placeholder:text-surface-400 text-sm focus:outline-none focus:ring-2
                   focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>

        <!-- Rol (autocomplete) -->
        <app-custom-autocomplete
          label="Rol"
          placeholder="Todos los roles..."
          [options]="rolesComoOpciones()"
          [(ngModel)]="filtroRol"
          name="filtroRol"
        />
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
      [rows]="usuarios()"
      [loading]="usuariosQuery.isPending()"
      [error]="usuariosQuery.isError() ? 'Error al cargar los usuarios' : null"
      [pagination]="paginacion()"
      [actions]="acciones"
      [excelConfig]="excelConfigUsuarios"
      emptyIcon="👥"
      emptyTitle="Sin usuarios"
      emptyMessage="No se encontraron usuarios con los filtros aplicados."
      (prevPage)="irPagina(paginaActual() - 1)"
      (nextPage)="irPagina(paginaActual() + 1)"
      (actionClick)="onAccion($event)"
    />
  `,
})
export class UsersListComponent {
  private readonly usuarioService = inject(UsuarioService);
  private readonly rolService     = inject(RolService);
  private readonly toast          = inject(ToastService);

  // ─── Outputs ─────────────────────────────────────────────────────────────

  editar        = output<UsuarioTabla>();
  eliminar      = output<UsuarioTabla>();
  gestionarCajas = output<UsuarioTabla>();

  // ─── Filtros (estado del formulario) ─────────────────────────────────────

  filtroNombre = '';
  filtroRut    = '';

  private _filtroRol = signal<AutocompleteOption | null>(null);
  get filtroRol(): AutocompleteOption | null { return this._filtroRol(); }
  set filtroRol(value: AutocompleteOption | null) { this._filtroRol.set(value); }

  // ─── Estado de búsqueda ───────────────────────────────────────────────────

  paginaActual      = signal(1);
  filtrosAplicados  = signal<UsuarioFilters>({});
  buscarVersion     = signal(0);

  // ─── Queries ─────────────────────────────────────────────────────────────

  rolesQuery = injectQuery(() => ({
    queryKey: ['roles-autocomplete'],
    queryFn: () => firstValueFrom(this.rolService.getRolesAutocomplete()),
  }));

  rolesComoOpciones = computed(
    () => (this.rolesQuery.data()?.data ?? []).map((r) => ({ id: r.id, label: r.nombre })),
  );

  usuariosQuery = injectQuery(() => ({
    queryKey: ['usuarios', this.filtrosAplicados(), this.paginaActual(), this.buscarVersion()],
    queryFn: () =>
      firstValueFrom(this.usuarioService.getAll(this.filtrosAplicados(), this.paginaActual())),
  }));

  usuarios = computed(
    () => ((this.usuariosQuery.data()?.data ?? []) as unknown) as Record<string, unknown>[],
  );

  paginacion = computed(() => {
    const meta = this.usuariosQuery.data()?.meta;
    if (!meta) return null;
    return { currentPage: meta.current_page, hasMore: meta.has_more };
  });

  // ─── Columnas ─────────────────────────────────────────────────────────────

  readonly columnas: TableColumn[] = [
    { key: 'nombre',     label: 'Nombre',   cellClass: 'font-medium text-surface-900' },
    { key: 'rut',        label: 'RUT',      cellClass: 'font-mono text-surface-600' },
    { key: 'correo',     label: 'Correo',   cellClass: 'text-surface-600' },
    { key: 'rolNombre',  label: 'Rol' },
    { key: 'totalCajas', label: 'Cajas',    align: 'center' },
  ];

  // ─── Excel Config ─────────────────────────────────────────────────────────

  readonly excelConfigUsuarios: ExcelConfig = {
    title: 'Usuarios — Excel',
    permiso: 'usuarios.excel',
    canPlantilla: true,
    canExportar: true,
    canImportar: true,
    onPlantilla: () => {
      this.toast.info('Plantilla', 'Descargando plantilla de usuarios...');
      console.log('[Excel] Obtener Plantilla');
    },
    onExportar: () => {
      this.toast.info('Exportar', 'Exportando datos de usuarios...');
      console.log('[Excel] Exportar Datos');
    },
    onImportar: (file: File) => {
      this.toast.success('Importar', `Archivo recibido: ${file.name}`);
      console.log('[Excel] Importar Data', file);
    },
  };

  // ─── Acciones ─────────────────────────────────────────────────────────────

  readonly acciones: TableAction[] = [
    { label: 'Editar',   variant: 'outline' },
    { label: 'Cajas',    variant: 'ghost' },
    { label: 'Eliminar', variant: 'danger' },
  ];

  // ─── Handlers ─────────────────────────────────────────────────────────────

  buscar(): void {
    const filters: UsuarioFilters = {};

    if (this.filtroNombre.trim()) {
      filters.nombre = this.filtroNombre.trim();
    }
    if (this.filtroRut.trim()) {
      filters.rut = this.filtroRut.trim();
    }
    if (this._filtroRol()) {
      filters.role_id = Number(this._filtroRol()!.id);
    }

    this.filtrosAplicados.set(filters);
    this.paginaActual.set(1);
    this.buscarVersion.update((v) => v + 1);
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroRut    = '';
    this._filtroRol.set(null);
    this.filtrosAplicados.set({});
    this.paginaActual.set(1);
    this.buscarVersion.set(0);
  }

  irPagina(pagina: number): void {
    this.paginaActual.set(pagina);
  }

  onAccion(event: { action: string; row: Record<string, unknown> }): void {
    const usuario = event.row as unknown as UsuarioTabla;
    if (event.action === 'Editar') {
      this.editar.emit(usuario);
    } else if (event.action === 'Cajas') {
      this.gestionarCajas.emit(usuario);
    } else if (event.action === 'Eliminar') {
      this.eliminar.emit(usuario);
    }
  }
}
