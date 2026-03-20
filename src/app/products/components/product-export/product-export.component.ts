import { Component, inject, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { ProductoService } from '../../services/producto.service';
import { ButtonComponent, ToastService } from '../../../shared/components';
import { IconCloseComponent, IconExcelComponent } from '../../../shared/icons';

@Component({
  selector: 'app-product-export',
  standalone: true,
  imports: [
    FormsModule,
    ButtonComponent,
    IconCloseComponent,
    IconExcelComponent,
  ],
  template: `
    <!-- Overlay -->
    <div
      class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
      (click)="onOverlayClick($event)"
    >
      <!-- Modal -->
      <div
        class="bg-white rounded-xl shadow-modal w-full max-w-lg z-50
               animate-[modalIn_200ms_ease-out_both] flex flex-col"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-surface-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center flex-shrink-0">
              <app-icon-excel class="w-5 h-5 text-success-600" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-surface-900">Exportar Productos</h2>
              <p class="text-sm text-surface-500 mt-0.5">Configurá el Excel que querés generar</p>
            </div>
          </div>
          <button
            (click)="cerrar.emit()"
            class="text-surface-400 hover:text-surface-700 transition-colors cursor-pointer
                   rounded-lg p-1 hover:bg-surface-100"
          >
            <app-icon-close class="w-5 h-5" />
          </button>
        </div>

        <!-- Cuerpo -->
        <div class="p-6 space-y-5 overflow-y-auto">

          <!-- Sección: Filtros -->
          <div>
            <p class="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">
              Filtros
            </p>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-surface-600 uppercase tracking-wide">
                Nombre
              </label>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                [(ngModel)]="filtroNombre"
                name="filtroNombre"
                class="px-3.5 py-2.5 bg-white border border-surface-300 rounded-lg text-surface-900
                       placeholder:text-surface-400 text-sm focus:outline-none focus:ring-2
                       focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          <div class="border-t border-surface-100"></div>

          <!-- Sección: Orden -->
          <div>
            <p class="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">
              Ordenar por nombre
            </p>
            <div class="flex gap-3">

              <label
                class="flex items-center gap-2.5 flex-1 border rounded-lg px-4 py-3 cursor-pointer
                       transition-colors"
                [class.border-primary-500]="orden === 'asc'"
                [class.bg-primary-50]="orden === 'asc'"
                [class.border-surface-200]="orden !== 'asc'"
              >
                <input
                  type="radio"
                  name="orden"
                  value="asc"
                  [(ngModel)]="orden"
                  class="accent-primary-600"
                />
                <div>
                  <p class="text-sm font-medium text-surface-800">A → Z</p>
                  <p class="text-xs text-surface-500">Orden alfabético ascendente</p>
                </div>
              </label>

              <label
                class="flex items-center gap-2.5 flex-1 border rounded-lg px-4 py-3 cursor-pointer
                       transition-colors"
                [class.border-primary-500]="orden === 'desc'"
                [class.bg-primary-50]="orden === 'desc'"
                [class.border-surface-200]="orden !== 'desc'"
              >
                <input
                  type="radio"
                  name="orden"
                  value="desc"
                  [(ngModel)]="orden"
                  class="accent-primary-600"
                />
                <div>
                  <p class="text-sm font-medium text-surface-800">Z → A</p>
                  <p class="text-xs text-surface-500">Orden alfabético descendente</p>
                </div>
              </label>

            </div>
          </div>

          <div class="border-t border-surface-100"></div>

          <!-- Sección: Cantidad -->
          <div>
            <p class="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">
              Cantidad de registros
            </p>

            <label class="flex items-center gap-3 mb-4 cursor-pointer group">
              <input
                type="checkbox"
                [(ngModel)]="exportarTodos"
                name="exportarTodos"
                class="w-4 h-4 rounded accent-primary-600 cursor-pointer"
              />
              <span class="text-sm font-medium text-surface-700 group-hover:text-surface-900 transition-colors">
                Exportar todos los registros
              </span>
            </label>

            @if (!exportarTodos) {
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-surface-600 uppercase tracking-wide">
                  Cantidad <span class="text-danger-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Ej: 100"
                  [(ngModel)]="cantidadRegistros"
                  name="cantidadRegistros"
                  min="1"
                  max="10000"
                  class="px-3.5 py-2.5 bg-white border rounded-lg text-surface-900
                         placeholder:text-surface-400 text-sm focus:outline-none focus:ring-2
                         focus:ring-primary-500 transition-colors"
                  [class.border-danger-400]="mostrarErrorCantidad()"
                  [class.border-surface-300]="!mostrarErrorCantidad()"
                />
                @if (mostrarErrorCantidad()) {
                  <p class="text-xs text-danger-500 mt-0.5">
                    Ingresá una cantidad válida entre 1 y 10.000.
                  </p>
                }
              </div>
            }

          </div>

        </div>

        <!-- Footer -->
        <div class="flex gap-3 p-6 pt-0 border-t border-surface-100 mt-2">
          <app-button
            variant="outline"
            [fullWidth]="true"
            type="button"
            (onClick)="cerrar.emit()"
          >
            Cancelar
          </app-button>
          <app-button
            variant="primary"
            [fullWidth]="true"
            type="button"
            [loading]="exportando()"
            [disabled]="!puedeExportar()"
            (onClick)="exportar()"
          >
            Exportar Excel
          </app-button>
        </div>
      </div>
    </div>
  `,
})
export class ProductExportComponent {
  private readonly productoService = inject(ProductoService);
  private readonly toast           = inject(ToastService);

  cerrar = output<void>();

  // ─── Estado del formulario ───────────────────────────────────────────────

  filtroNombre      = '';
  orden             = 'asc';
  exportarTodos     = false;
  cantidadRegistros: number | null = null;

  // ─── Estado de carga ─────────────────────────────────────────────────────

  exportando      = signal(false);
  intentoExportar = signal(false);

  // ─── Validaciones ────────────────────────────────────────────────────────

  mostrarErrorCantidad = computed(() =>
    this.intentoExportar() &&
    !this.exportarTodos &&
    (this.cantidadRegistros === null || this.cantidadRegistros < 1 || this.cantidadRegistros > 10000),
  );

  puedeExportar(): boolean {
    if (this.exportando()) return false;
    if (!this.exportarTodos) {
      return (
        this.cantidadRegistros !== null &&
        this.cantidadRegistros >= 1 &&
        this.cantidadRegistros <= 10000
      );
    }
    return true;
  }

  // ─── Handlers ────────────────────────────────────────────────────────────

  async exportar(): Promise<void> {
    this.intentoExportar.set(true);
    if (!this.puedeExportar()) return;

    this.exportando.set(true);
    try {
      const blob = await firstValueFrom(
        this.productoService.exportar({
          nombre: this.filtroNombre.trim() || undefined,
          orden:  this.orden as 'asc' | 'desc',
          todos:  this.exportarTodos,
          limite: this.exportarTodos ? undefined : (this.cantidadRegistros ?? undefined),
        }),
      );

      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `productos_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);

      this.toast.success('Excel generado', 'La descarga comenzó correctamente.');
      this.cerrar.emit();
    } catch (err) {
      console.error('[ProductExport]', err);
      this.toast.error('Error al exportar', 'No se pudo generar el Excel. Intentá de nuevo.');
    } finally {
      this.exportando.set(false);
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrar.emit();
    }
  }
}
