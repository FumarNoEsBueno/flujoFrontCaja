import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';

import { MovimientoService } from '../../services/movimiento.service';
import type { CajaAutocomplete, CreateMovimientoRequest, Movimiento, ProductoLineaItem, UpdateMovimientoRequest } from '../../models';
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
import { IconCloseComponent, IconWarningComponent } from '../../../shared/icons';

@Component({
  selector: 'app-movement-form',
  standalone: true,
  imports: [ButtonComponent, InputComponent, FormsModule, CustomAutocompleteComponent, ProductSelectorComponent, IconCloseComponent, IconWarningComponent],
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
            <h2 class="text-lg font-bold text-surface-900">
              {{ mode() === 'edit' ? 'Editar Movimiento' : 'Nuevo Movimiento' }}
            </h2>
            <p class="text-sm text-surface-500 mt-0.5">
              {{ mode() === 'edit' ? 'Actualizá los datos del movimiento' : 'Completá los datos del movimiento' }}
            </p>
          </div>
          <button
            (click)="cerrar.emit()"
            class="text-surface-400 hover:text-surface-700 transition-colors cursor-pointer
                   rounded-lg p-1 hover:bg-surface-100"
          >
            <app-icon-close class="w-5 h-5" />
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
                <app-icon-warning class="w-5 h-5" />
              </div>
              <p class="text-sm text-danger-700 leading-snug">{{ errorMsg() }}</p>
            </div>
          }

          <!-- Caja (autocomplete) — only shown in create mode -->
          @if (mode() === 'create') {
            <app-custom-autocomplete
              label="Caja"
              placeholder="Buscá una caja..."
              [required]="true"
              [options]="cajasComoOpciones()"
              [(ngModel)]="cajaSeleccionada"
              name="caja"
            />
          }

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
            [initialLineas]="_productos()"
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
              {{ mode() === 'edit' ? 'Actualizar' : 'Guardar' }}
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

  /** Modo del formulario: 'create' | 'edit' */
  mode = input<'create' | 'edit'>('create');

  /** Movimiento a editar (solo usado en modo edit) */
  movimiento = input<Movimiento | null>(null);

  /** ID del movimiento a editar (solo usado en modo edit) */
  id = input<number | null>(null);

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
  _productos = signal<ProductoLineaItem[]>([]);

  constructor() {
    // Pre-populate form when in edit mode.
    // IMPORTANT: read movimiento() BEFORE the if, so Angular tracks it as a dependency
    // regardless of whether m is null. This ensures the effect re-runs when
    // movimiento() is set AFTER formMode is changed to 'edit'.
    effect(() => {
      const m = this.movimiento(); // tracked unconditionally
      const isEdit = this.mode() === 'edit';
      if (!m || !isEdit) return;

      // MovimientoResource returns fechaIngreso as d/m/Y, but date input needs Y-m-d
      const fechaParts = m.fechaIngreso.split('/');
      const fechaISO = fechaParts.length === 3
        ? `${fechaParts[2]}-${fechaParts[1]}-${fechaParts[0]}`
        : m.fechaIngreso;

      // montoTotal may come from the API as a number — always convert to string
      // for the form inputs which expect string values
      this.form.set({
        movi_descripcion: m.descripcion ?? '',
        movi_fecha_ingreso: fechaISO,
        movi_monto_total: String(m.montoTotal ?? ''),
        movi_medio_pago: m.medioPago ?? '',
        movi_propina: m.propina != null ? String(m.propina) : null,
      });

      if (m.productos && m.productos.length > 0) {
        this._productos.set(m.productos.map((p) => ({
          prod_id: p.id,
          label: p.nombre ?? '',
          precio: p.montoUnitario,
          cantidad: p.cantidad,
        })));
      }
    });
  }

  onProductosChange(lineas: ProductoLineaItem[]): void {
    this._productos.set(lineas);
  }

  /** Adapta CajaAutocomplete[] al formato AutocompleteOption[] */
  cajasComoOpciones() {
    return this.cajasDisponibles().map((c) => ({ id: c.id, label: c.label }));
  }

  formValido(): boolean {
    const f = this.form();
    const isEdit = this.mode() === 'edit';
    // Use String() to defensively convert — the API may return numbers
    const descripcion = String(f.movi_descripcion ?? '').trim();
    const fecha = String(f.movi_fecha_ingreso ?? '').trim();
    const monto = String(f.movi_monto_total ?? '').trim();
    const medioPago = String(f.movi_medio_pago ?? '').trim();
    return !!(
      (isEdit || this._cajaSeleccionada()) &&
      descripcion &&
      fecha &&
      monto &&
      medioPago
    );
  }

  // ─── Mutation ──────────────────────────────────────────────────────────────

  mutation = injectMutation(() => ({
    mutationFn: (payload: CreateMovimientoRequest | UpdateMovimientoRequest) => {
      if (this.mode() === 'edit' && this.id()) {
        return this.movimientoService.update(this.id()!, payload as UpdateMovimientoRequest).toPromise();
      }
      return this.movimientoService.create(payload as CreateMovimientoRequest).toPromise();
    },
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      if (this.mode() === 'edit') {
        this.toast.success('Movimiento actualizado', 'El movimiento fue actualizado correctamente.');
      } else {
        this.toast.success('Movimiento guardado', 'El movimiento fue registrado correctamente.');
      }
      this.guardado.emit();
    },
    onError: () => {
      this.errorMsg.set('Error al guardar el movimiento. Revisá los datos e intentá de nuevo.');
      this.toast.error('No se pudo guardar', 'Revisá los datos e intentá de nuevo.');
    },
  }));

  submit(): void {
    const caja = this._cajaSeleccionada();
    const isEdit = this.mode() === 'edit';

    if (!this.formValido()) return;
    if (!isEdit && !caja) return; // caja required only on create

    this.errorMsg.set('');

    const lineas = this._productos();
    const basePayload = this.form();

    // Build payload based on mode
    const payload: CreateMovimientoRequest | UpdateMovimientoRequest = isEdit
      ? {
          ...basePayload,
          ...(lineas.length > 0 && {
            productos: lineas.map((l) => ({
              prod_id: l.prod_id,
              pdmo_cantidad: l.cantidad,
            })),
          }),
        }
      : {
          ...basePayload,
          caja_id: Number(caja!.id),
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
