import { Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';

import { ProductoService } from '../../services/producto.service';
import type { ProductoFilters } from '../../services/producto.service';
import type { ProductoTabla } from '../../models';
import {
  ButtonComponent,
  CardComponent,
  CustomTableComponent,
  ToastService,
} from '../../../shared/components';
import type { TableAction, TableColumn, ExcelConfig } from '../../../shared/components';
import { ProductExportComponent } from '../product-export/product-export.component';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    FormsModule,
    CardComponent,
    ButtonComponent,
    CustomTableComponent,
    ProductExportComponent,
  ],
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
      [rows]="productos()"
      [loading]="productosQuery.isPending()"
      [error]="productosQuery.isError() ? 'Error al cargar los productos' : null"
      [pagination]="paginacion()"
      [actions]="acciones"
      [excelConfig]="excelConfigProductos"
      emptyIcon="📦"
      emptyTitle="Sin productos"
      emptyMessage="No se encontraron productos con los filtros aplicados."
      (prevPage)="irPagina(paginaActual() - 1)"
      (nextPage)="irPagina(paginaActual() + 1)"
      (actionClick)="onAccion($event)"
    />

    @if (mostrandoExport()) {
      <app-product-export (cerrar)="mostrandoExport.set(false)" />
    }
  `,
})
export class ProductsListComponent {
  private readonly productoService = inject(ProductoService);
  private readonly toast           = inject(ToastService);

  // ─── Outputs ─────────────────────────────────────────────────────────────

  editar   = output<ProductoTabla>();
  eliminar = output<ProductoTabla>();

  // ─── Estado de modales ────────────────────────────────────────────────────

  mostrandoExport = signal(false);

  // ─── Filtros (estado del formulario) ─────────────────────────────────────

  filtroNombre = '';

  // ─── Estado de búsqueda ───────────────────────────────────────────────────

  paginaActual     = signal(1);
  filtrosAplicados = signal<ProductoFilters>({});
  buscarVersion    = signal(0);

  // ─── Queries ─────────────────────────────────────────────────────────────

  productosQuery = injectQuery(() => ({
    queryKey: ['productos', this.filtrosAplicados(), this.paginaActual(), this.buscarVersion()],
    queryFn: () =>
      firstValueFrom(this.productoService.getAll(this.filtrosAplicados(), this.paginaActual())),
  }));

  productos = computed(
    () => ((this.productosQuery.data()?.data ?? []) as unknown) as Record<string, unknown>[],
  );

  paginacion = computed(() => {
    const meta = this.productosQuery.data()?.meta;
    if (!meta) return null;
    return { currentPage: meta.current_page, hasMore: meta.has_more };
  });

  // ─── Columnas ─────────────────────────────────────────────────────────────

  readonly columnas: TableColumn[] = [
    { key: 'nombre', label: 'Nombre', cellClass: 'font-medium text-surface-900' },
    {
      key: 'precio',
      label: 'Precio',
      align: 'right',
      format: (v) => `$${Number(v).toLocaleString('es-CL')}`,
    },
  ];

  // ─── Excel Config ─────────────────────────────────────────────────────────

  readonly excelConfigProductos: ExcelConfig = {
    title: 'Productos — Excel',
    permiso: 'productos.excel',
    canPlantilla: true,
    canExportar: true,
    canImportar: true,
    onPlantilla: () => void this.descargarPlantilla(),
    onExportar: () => this.mostrandoExport.set(true),
    onImportar: (file: File) => void this.importar(file),
  };

  // ─── Acciones ─────────────────────────────────────────────────────────────

  readonly acciones: TableAction[] = [
    { label: 'Editar',   variant: 'outline' },
    { label: 'Eliminar', variant: 'danger' },
  ];

  // ─── Handlers ─────────────────────────────────────────────────────────────

  buscar(): void {
    const filters: ProductoFilters = {};

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
    const producto = event.row as unknown as ProductoTabla;
    if (event.action === 'Editar') {
      this.editar.emit(producto);
    } else if (event.action === 'Eliminar') {
      this.eliminar.emit(producto);
    }
  }

  // ─── Excel ────────────────────────────────────────────────────────────────

  async descargarPlantilla(): Promise<void> {
    this.toast.info('Plantilla', 'Preparando descarga...');
    try {
      const blob = await firstValueFrom(this.productoService.descargarPlantilla());
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `plantilla_productos_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      this.toast.success('Plantilla descargada', 'Ya podés abrirla en Excel y completar los datos.');
    } catch (err) {
      console.error('[descargarPlantilla]', err);
      this.toast.error('Error al descargar', 'No se pudo descargar la plantilla. Intentá de nuevo.');
    }
  }

  async importar(archivo: File): Promise<void> {
    const emailReporte = prompt('¿A qué correo enviamos el reporte de importación?')?.trim();
    if (!emailReporte) return;

    this.toast.info('Importando', `Procesando ${archivo.name}...`);
    try {
      const res = await firstValueFrom(this.productoService.importar(archivo, emailReporte));
      if (res.data.errores === 0) {
        this.toast.success(
          'Importación exitosa',
          `${res.data.importados} productos importados correctamente.`,
        );
      } else {
        this.toast.warning(
          'Importación con errores',
          `${res.data.importados} importados, ${res.data.errores} con errores. Revisá tu correo.`,
        );
      }
      // Refrescar la tabla
      this.buscarVersion.update((v) => v + 1);
    } catch (err) {
      console.error('[importar]', err);
      this.toast.error('Error al importar', 'No se pudo procesar el archivo. Verificá que sea una planilla válida.');
    }
  }
}
