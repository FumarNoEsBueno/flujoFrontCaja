import { Component, input, output, signal } from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { IconExcelComponent, IconCloseComponent } from '../../icons';

// ─── Config Interface ─────────────────────────────────────────────────────────

export interface ExcelConfig {
  /** Título que aparece en el header del modal */
  title: string;
  /** Permiso para mostrar el botón Excel en la tabla */
  permiso: string;
  /** Muestra el botón "Obtener Plantilla" */
  canPlantilla: boolean;
  /** Muestra el botón "Exportar Datos" */
  canExportar: boolean;
  /** Muestra el botón "Importar Data" */
  canImportar: boolean;
  /** Handler plantilla */
  onPlantilla?: () => void;
  /** Handler exportar */
  onExportar?: () => void;
  /** Handler importar — recibe el archivo seleccionado */
  onImportar?: (file: File) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-excel-modal',
  standalone: true,
  imports: [ButtonComponent, IconExcelComponent, IconCloseComponent],
  template: `
    <!-- Overlay -->
    <div
      class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
      (click)="cerrar.emit()"
    >
      <!-- Modal -->
      <div
        class="bg-white rounded-xl shadow-xl w-full max-w-md z-50
               animate-[modalIn_200ms_ease-out_both]"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-surface-200">
          <div class="flex items-center gap-3">
            <!-- Ícono Excel verde -->
            <div class="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center flex-shrink-0">
              <app-icon-excel class="w-5 h-5 text-success-600" />
            </div>
            <div>
              <h2 class="text-base font-bold text-surface-900">{{ config().title }}</h2>
              <p class="text-xs text-surface-500">Operaciones de Excel</p>
            </div>
          </div>
          <!-- Botón cerrar -->
          <button
            class="text-surface-400 hover:text-surface-600 transition-colors"
            (click)="cerrar.emit()"
            aria-label="Cerrar"
          >
            <app-icon-close class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="px-6 py-5 space-y-4">

          <!-- Obtener Plantilla -->
          @if (config().canPlantilla) {
            <div class="border border-surface-200 rounded-lg p-4">
              <p class="text-sm font-medium text-surface-700 mb-1">Plantilla</p>
              <p class="text-xs text-surface-500 mb-3">
                Descargá la plantilla para cargar datos masivamente.
              </p>
              <app-button
                variant="outline"
                size="sm"
                (onClick)="handlePlantilla()"
              >
                ↓ Obtener Plantilla
              </app-button>
            </div>
          }

          <!-- Exportar Datos -->
          @if (config().canExportar) {
            <div class="border border-surface-200 rounded-lg p-4">
              <p class="text-sm font-medium text-surface-700 mb-1">Exportar</p>
              <p class="text-xs text-surface-500 mb-3">
                Exportá todos los datos actuales a un archivo Excel.
              </p>
              <app-button
                variant="outline"
                size="sm"
                (onClick)="handleExportar()"
              >
                ↑ Exportar Datos
              </app-button>
            </div>
          }

          <!-- Importar Data -->
          @if (config().canImportar) {
            <div class="border border-surface-200 rounded-lg p-4">
              <p class="text-sm font-medium text-surface-700 mb-1">Importar</p>
              <p class="text-xs text-surface-500 mb-3">
                Seleccioná un archivo <strong>.xlsx</strong> o <strong>.csv</strong> para importar.
              </p>
              <!-- Input file oculto -->
              <input
                #fileInput
                type="file"
                accept=".xlsx,.csv"
                class="hidden"
                (change)="onFileChange($event)"
              />
              <!-- Zona de selección -->
              <div
                class="border-2 border-dashed border-surface-300 rounded-lg p-4 text-center
                       cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors mb-3"
                (click)="fileInput.click()"
              >
                @if (archivoSeleccionado()) {
                  <p class="text-sm font-medium text-primary-700">{{ archivoSeleccionado()!.name }}</p>
                  <p class="text-xs text-surface-500 mt-0.5">Click para cambiar el archivo</p>
                } @else {
                  <p class="text-sm text-surface-500">Click para seleccionar archivo</p>
                  <p class="text-xs text-surface-400 mt-0.5">.xlsx o .csv</p>
                }
              </div>
              <!-- Botón importar -->
              <app-button
                variant="primary"
                size="sm"
                [disabled]="!archivoSeleccionado()"
                (onClick)="handleImportar()"
              >
                ↑ Importar Data
              </app-button>
            </div>
          }

        </div>

        <!-- Footer -->
        <div class="px-6 pb-6">
          <app-button variant="outline" [fullWidth]="true" (onClick)="cerrar.emit()">
            Cerrar
          </app-button>
        </div>
      </div>
    </div>
  `,
})
export class ExcelModalComponent {
  config = input.required<ExcelConfig>();

  cerrar = output<void>();

  archivoSeleccionado = signal<File | null>(null);

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.archivoSeleccionado.set(file);
  }

  handlePlantilla(): void {
    this.config().onPlantilla?.();
  }

  handleExportar(): void {
    this.config().onExportar?.();
  }

  handleImportar(): void {
    const file = this.archivoSeleccionado();
    if (!file) return;
    this.config().onImportar?.(file);
  }
}
