import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';

import { MovimientoService } from '../../services/movimiento.service';
import type { CajaAutocomplete, CreateMovimientoRequest, ProductoLineaItem } from '../../models';
import {
  ButtonComponent,
  InputComponent,
  ToastService,
} from '../../../shared/components';
import {
  CustomAutocompleteComponent,
} from '../../../shared/components/autocomplete/custom-autocomplete.component';
import type { AutocompleteOption } from '../../../shared/components';
import { ProductSelectorComponent } from '../product-selector/product-selector.component';

@Component({
  selector: 'app-movement-form',
  standalone: true,
  imports: [ButtonComponent, InputComponent, FormsModule, CustomAutocompleteComponent, ProductSelectorComponent],
  template: `
    <!-- Overlay -->
    <div
      class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
      (click)="onOverlayClick($event)"
    >
      <!-- Modal con animación scale+fade -->
      <div
        class="bg-white rounded-xl shadow-modal w-full max-w-lg z-50
               animate-[modalIn_200ms_ease-out_both] flex flex-col max-h-[90vh]"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-surface-200 flex-shrink-0">
          <div>
            <h2 class="text-lg font-bold text-surface-900">Nuevo Movimiento</h2>
            <p class="text-sm text-surface-500 mt-0.5">Completá los datos del movimiento</p>
          </div>
          <button
            (click)="cerrar.emit()"
            class="text-surface-400 hover:text-surface-700 transition-colors cursor-pointer
                   rounded-lg p-1 hover:bg-surface-100"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form (ngSubmit)="submit()" class="flex flex-col flex-1 overflow-hidden">
          <!-- Área scrolleable -->
          <div class="overflow-y-auto flex-1 p-6 space-y-4">

          <!-- Error inline mejorado -->
          @if (errorMsg()) {
            <div class="flex items-start gap-3 p-3.5 bg-danger-50 border border-danger-200
                        rounded-lg animate-[fadeIn_150ms_ease-out_both]">
              <div class="flex-shrink-0 w-5 h-5 mt-0.5 text-danger-500">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
              </div>
              <p class="text-sm text-danger-700 leading-snug">{{ errorMsg() }}</p>
            </div>
          }

          <!-- Caja (autocomplete) -->
          <app-custom-autocomplete
            label="Caja"
            placeholder="Buscá una caja..."
            [required]="true"
            [options]="cajasComoOpciones()"
            [(ngModel)]="cajaSeleccionada"
            name="caja"
          />

          <app-input
            label="Descripción"
            placeholder="Ej: Venta de productos"
            [required]="true"
            [(ngModel)]="form().movi_descripcion"
            name="movi_descripcion"
          />

          <app-input
            label="Fecha de ingreso"
            type="date"
            [required]="true"
            [(ngModel)]="form().movi_fecha_ingreso"
            name="movi_fecha_ingreso"
          />

          <app-input
            label="Monto total"
            placeholder="Ej: 25000"
            [required]="true"
            [(ngModel)]="form().movi_monto_total"
            name="movi_monto_total"
          />

          <app-input
            label="Medio de pago"
            placeholder="Ej: Transbank, Efectivo"
            [required]="true"
            [(ngModel)]="form().movi_medio_pago"
            name="movi_medio_pago"
          />

          <app-input
            label="Propina (opcional)"
            placeholder="Ej: 1000"
            [(ngModel)]="form().movi_propina"
            name="movi_propina"
          />

          <!-- Selector de productos -->
          <app-product-selector
            (productosChange)="onProductosChange($event)"
          />

          </div><!-- /scroll area -->

          <!-- Footer con botones — fijo, no scrollea -->
          <div class="flex gap-3 p-6 pt-4 border-t border-surface-200 flex-shrink-0">
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
              type="submit"
              [loading]="mutation.isPending()"
              [disabled]="!formValido()"
            >
              Guardar
            </app-button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class MovementFormComponent {
  private readonly movimientoService = inject(MovimientoService);
  private readonly queryClient = injectQueryClient();
  private readonly toast = inject(ToastService);

  // ─── Inputs ────────────────────────────────────────────────────────────────

  /** Lista de cajas disponibles (cargada por MovementsListComponent) */
  cajasDisponibles = input<CajaAutocomplete[]>([]);

  // ─── Outputs ───────────────────────────────────────────────────────────────

  cerrar  = output<void>();
  guardado = output<void>();

  // ─── Estado interno ────────────────────────────────────────────────────────

  errorMsg = signal('');

  /** Signal interno para la caja — necesario para que formValido() sea reactivo */
  private _cajaSeleccionada = signal<AutocompleteOption | null>(null);

  /**
   * ngModel escribe aquí vía setter.
   * El getter devuelve el valor actual para que ngModel pueda leerlo.
   */
  get cajaSeleccionada(): AutocompleteOption | null {
    return this._cajaSeleccionada();
  }
  set cajaSeleccionada(value: AutocompleteOption | null) {
    this._cajaSeleccionada.set(value);
  }

  form = signal<Omit<CreateMovimientoRequest, 'caja_id' | 'productos'>>({
    movi_descripcion: '',
    movi_fecha_ingreso: new Date().toISOString().slice(0, 10),
    movi_monto_total: '',
    movi_medio_pago: 'Transbank',
    movi_propina: null,
  });

  /** Productos seleccionados en el selector */
  private _productos = signal<ProductoLineaItem[]>([]);

  onProductosChange(lineas: ProductoLineaItem[]): void {
    this._productos.set(lineas);
  }

  /** Adapta CajaAutocomplete[] al formato AutocompleteOption[] */
  cajasComoOpciones() {
    return this.cajasDisponibles().map((c) => ({ id: c.id, label: c.label }));
  }

  formValido(): boolean {
    const f = this.form();
    return !!(
      this._cajaSeleccionada() &&
      f.movi_descripcion.trim() &&
      f.movi_fecha_ingreso.trim() &&
      f.movi_monto_total.trim() &&
      f.movi_medio_pago.trim()
    );
  }

  // ─── Mutation ──────────────────────────────────────────────────────────────

  mutation = injectMutation(() => ({
    mutationFn: (payload: CreateMovimientoRequest) =>
      this.movimientoService.create(payload).toPromise(),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      this.toast.success('Movimiento guardado', 'El movimiento fue registrado correctamente.');
      this.guardado.emit();
    },
    onError: () => {
      this.errorMsg.set('Error al guardar el movimiento. Revisá los datos e intentá de nuevo.');
      this.toast.error('No se pudo guardar', 'Revisá los datos e intentá de nuevo.');
    },
  }));

  submit(): void {
    const caja = this._cajaSeleccionada();
    if (!this.formValido() || !caja) return;

    this.errorMsg.set('');

    const lineas = this._productos();
    const payload: CreateMovimientoRequest = {
      ...this.form(),
      caja_id: Number(caja.id),
      ...(lineas.length > 0 && {
        productos: lineas.map((l) => ({
          prod_id: l.prod_id,
          pdmo_cantidad: l.cantidad,
        })),
      }),
    };

    this.mutation.mutate(payload);
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrar.emit();
    }
  }
}
