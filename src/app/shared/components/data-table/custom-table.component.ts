import {
  Component,
  input,
  output,
  computed,
  signal,
  inject,
} from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { CardComponent } from '../card/card.component';
import { ExcelModalComponent } from '../excel-modal/excel-modal.component';
import type { ExcelConfig } from '../excel-modal/excel-modal.component';
import { AuthStore } from '../../../auth/store/auth.store';
import { IconExcelComponent } from '../../icons';

// ─── Column Definition ────────────────────────────────────────────────────────

export interface TableColumn<T = Record<string, unknown>> {
  /** Clave del objeto — soporta dot notation: 'user.name' */
  key: string;
  /** Encabezado visible */
  label: string;
  /** Alineación de la celda (default: left) */
  align?: 'left' | 'center' | 'right';
  /** CSS extra para la celda */
  cellClass?: string;
  /** Función de formateo del valor */
  format?: (value: unknown, row: T) => string;
}

// ─── Row Action ───────────────────────────────────────────────────────────────

export interface TableAction<T = Record<string, unknown>> {
  label: string;
  variant?: 'primary' | 'danger' | 'outline' | 'ghost';
  /** Condición para mostrar el botón (default: siempre) */
  show?: (row: T) => boolean;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface TablePagination {
  currentPage: number;
  hasMore: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-custom-table',
  standalone: true,
  imports: [CardComponent, ButtonComponent, ExcelModalComponent, IconExcelComponent],
  template: `
    <!-- Loading skeleton -->
    @if (loading()) {
      <app-card [padding]="'none'">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-200 bg-surface-50">
                @for (col of columns(); track col.key) {
                  <th class="px-6 py-3">
                    <div class="h-3 bg-surface-200 rounded animate-pulse w-20"></div>
                  </th>
                }
                @if (actions().length > 0) {
                  <th class="px-6 py-3 text-right">
                    <div class="h-3 bg-surface-200 rounded animate-pulse w-16 ml-auto"></div>
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              @for (row of skeletonRows(); track row) {
                <tr class="border-b border-surface-100">
                  @for (col of columns(); track col.key) {
                    <td class="px-6 py-4">
                      <div
                        class="h-3.5 bg-surface-100 rounded animate-pulse"
                        [style.width]="skeletonWidthFor(row)"
                      ></div>
                    </td>
                  }
                  @if (actions().length > 0) {
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-end gap-2">
                        @for (action of actions(); track action.label) {
                          <div class="h-7 w-14 bg-surface-100 rounded-lg animate-pulse"></div>
                        }
                      </div>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      </app-card>
    }

    <!-- Error -->
    @else if (error()) {
      <app-card>
        <div class="text-center text-danger-600 py-8">
          <p class="font-medium">{{ error() }}</p>
          <p class="text-sm text-surface-500 mt-1">Intentá recargar la página.</p>
        </div>
      </app-card>
    }

    <!-- Empty -->
    @else if (!loading() && rows().length === 0) {
      <app-card>
        <!-- Toolbar vacío con botón Excel -->
        @if (mostrarBotonExcel()) {
          <div class="flex justify-end pb-4 border-b border-surface-200 mb-4">
            <app-button
              variant="outline"
              size="sm"
              (onClick)="abrirExcelModal()"
            >
              <span class="flex items-center gap-1.5">
                <app-icon-excel class="w-4 h-4 text-success-600" />
                Excel
              </span>
            </app-button>
          </div>
        }
        <div class="flex items-center justify-center py-16 text-surface-400">
          <div class="text-center">
            <span class="text-5xl mb-4 block">{{ emptyIcon() }}</span>
            <p class="text-lg font-medium text-surface-600 mb-1">{{ emptyTitle() }}</p>
            <p class="text-sm">{{ emptyMessage() }}</p>
          </div>
        </div>
      </app-card>
    }

    <!-- Table -->
    @else {
      <app-card [padding]="'none'">
        <!-- Toolbar -->
        @if (mostrarBotonExcel()) {
          <div class="flex justify-end px-6 py-3 border-b border-surface-200">
            <app-button
              variant="outline"
              size="sm"
              (onClick)="abrirExcelModal()"
            >
              <span class="flex items-center gap-1.5">
                <app-icon-excel class="w-4 h-4 text-success-600" />
                Excel
              </span>
            </app-button>
          </div>
        }

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-200 bg-surface-50">
                @for (col of columns(); track col.key) {
                  <th
                    class="px-6 py-3 font-semibold text-surface-600"
                    [class]="thAlignClass(col.align)"
                  >
                    {{ col.label }}
                  </th>
                }
                @if (actions().length > 0) {
                  <th class="text-right px-6 py-3 font-semibold text-surface-600">
                    Acciones
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              @for (row of rows(); track trackById(row)) {
                <tr class="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                  @for (col of columns(); track col.key) {
                    <td
                      class="px-6 py-4 text-surface-700"
                      [class]="tdAlignClass(col.align) + ' ' + (col.cellClass ?? '')"
                    >
                      {{ resolveCell(row, col) }}
                    </td>
                  }
                  @if (actions().length > 0) {
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-end gap-2">
                        @for (action of actions(); track action.label) {
                          @if (!action.show || action.show(row)) {
                            <app-button
                              [variant]="action.variant ?? 'ghost'"
                              size="sm"
                              (onClick)="actionClick.emit({ action: action.label, row })"
                            >
                              {{ action.label }}
                            </app-button>
                          }
                        }
                      </div>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        @if (pagination()) {
          <div class="flex items-center justify-between px-6 py-4 border-t border-surface-200">
            <p class="text-sm text-surface-500">
              Página {{ pagination()!.currentPage }}
            </p>
            <div class="flex gap-2">
              <app-button
                variant="outline"
                size="sm"
                [disabled]="pagination()!.currentPage === 1"
                (onClick)="prevPage.emit()"
              >
                ← Anterior
              </app-button>
              <app-button
                variant="outline"
                size="sm"
                [disabled]="!pagination()!.hasMore"
                (onClick)="nextPage.emit()"
              >
                Siguiente →
              </app-button>
            </div>
          </div>
        }
      </app-card>
    }

    <!-- Excel Modal -->
    @if (excelModalAbierto() && excelConfig()) {
      <app-excel-modal
        [config]="excelConfig()!"
        (cerrar)="cerrarExcelModal()"
      />
    }
  `,
})
export class CustomTableComponent {
  private readonly authStore = inject(AuthStore);

  // ─── Inputs ────────────────────────────────────────────────────────────────

  columns    = input.required<TableColumn[]>();
  rows       = input<Record<string, unknown>[]>([]);
  loading    = input<boolean>(false);
  error      = input<string | null>(null);
  pagination = input<TablePagination | null>(null);
  actions    = input<TableAction[]>([]);

  emptyIcon    = input<string>('📭');
  emptyTitle   = input<string>('Sin resultados');
  emptyMessage = input<string>('No hay datos para mostrar.');
  /** Filas a mostrar en el skeleton (default: 5) */
  skeletonCount = input<number>(5);

  /** Config Excel opcional — si se pasa y el usuario tiene el permiso, aparece el botón */
  excelConfig = input<ExcelConfig | null>(null);

  // ─── Outputs ───────────────────────────────────────────────────────────────

  nextPage    = output<void>();
  prevPage    = output<void>();

  /** Emite { action: 'Ver' | 'Eliminar' | ..., row } cuando se hace click en una acción */
  actionClick = output<{ action: string; row: Record<string, unknown> }>();

  // ─── Estado interno ────────────────────────────────────────────────────────

  excelModalAbierto = signal(false);

  // ─── Computed ──────────────────────────────────────────────────────────────

  mostrarBotonExcel = computed(() => {
    const cfg = this.excelConfig();
    if (!cfg) return false;
    return this.authStore.hasPermission(cfg.permiso);
  });

  // ─── Skeleton helpers ──────────────────────────────────────────────────────

  skeletonRows = computed(() => Array.from({ length: this.skeletonCount() }, (_, i) => i));

  skeletonWidthFor(index: number): string {
    // Anchos deterministas por índice — evita NG0100 ExpressionChangedAfterItHasBeenChecked
    const widths = ['60%', '75%', '50%', '80%', '65%'];
    return widths[index % widths.length];
  }

  // ─── Excel modal ───────────────────────────────────────────────────────────

  abrirExcelModal(): void {
    this.excelModalAbierto.set(true);
  }

  cerrarExcelModal(): void {
    this.excelModalAbierto.set(false);
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  trackById(row: Record<string, unknown>): unknown {
    return row['id'] ?? row;
  }

  resolveCell(row: Record<string, unknown>, col: TableColumn): string {
    const value = col.key.split('.').reduce<unknown>((obj, key) => {
      if (obj != null && typeof obj === 'object') {
        return (obj as Record<string, unknown>)[key];
      }
      return undefined;
    }, row);

    if (col.format) return col.format(value, row);
    if (value == null) return '—';
    return String(value);
  }

  thAlignClass(align?: 'left' | 'center' | 'right'): string {
    const map: Record<string, string> = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };
    return map[align ?? 'left'];
  }

  tdAlignClass(align?: 'left' | 'center' | 'right'): string {
    return this.thAlignClass(align);
  }
}
