import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  injectMutation,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';

import { ProductoService } from '../../services/producto.service';
import type { CreateProductoPayload, ProductoTabla, UpdateProductoPayload } from '../../models';
import {
  ButtonComponent,
  InputComponent,
  ToastService,
} from '../../../shared/components';
import { IconCloseComponent, IconWarningComponent } from '../../../shared/icons';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    FormsModule,
    ButtonComponent,
    InputComponent,
    IconCloseComponent,
    IconWarningComponent,
  ],
  template: `
    <!-- Overlay -->
    <div
      class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
      (click)="onOverlayClick($event)"
    >
      <!-- Modal -->
      <div
        class="bg-white rounded-xl shadow-modal w-full max-w-md z-50
               animate-[modalIn_200ms_ease-out_both] flex flex-col max-h-[90vh]"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-surface-200 flex-shrink-0">
          <div>
            @if (esEdicion()) {
              <h2 class="text-lg font-bold text-surface-900">Editar Producto</h2>
              <p class="text-sm text-surface-500 mt-0.5">Modificá los datos del producto</p>
            } @else {
              <h2 class="text-lg font-bold text-surface-900">Nuevo Producto</h2>
              <p class="text-sm text-surface-500 mt-0.5">Completá los datos del nuevo producto</p>
            }
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

            <!-- Error inline -->
            @if (errorMsg()) {
              <div class="flex items-start gap-3 p-3.5 bg-danger-50 border border-danger-200
                          rounded-lg animate-[fadeIn_150ms_ease-out_both]">
                <div class="flex-shrink-0 w-5 h-5 mt-0.5 text-danger-500">
                  <app-icon-warning class="w-5 h-5" />
                </div>
                <p class="text-sm text-danger-700 leading-snug">{{ errorMsg() }}</p>
              </div>
            }

            <!-- Nombre -->
            <app-input
              label="Nombre del producto"
              placeholder="Ej: Coca-Cola 350ml"
              [required]="true"
              [(ngModel)]="prod_nombre"
              name="prod_nombre"
            />

            <!-- Precio -->
            <app-input
              label="Precio"
              type="number"
              placeholder="Ej: 1500"
              [required]="true"
              [(ngModel)]="prod_precio"
              name="prod_precio"
            />

          </div><!-- /scroll -->

          <!-- Footer -->
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
export class ProductFormComponent {
  private readonly productoService = inject(ProductoService);
  private readonly queryClient     = injectQueryClient();
  private readonly toast           = inject(ToastService);

  // ─── Inputs ────────────────────────────────────────────────────────────────

  /** null = crear, non-null = editar */
  producto = input<ProductoTabla | null>(null);

  // ─── Outputs ───────────────────────────────────────────────────────────────

  cerrar  = output<void>();
  guardado = output<void>();

  // ─── Estado interno ────────────────────────────────────────────────────────

  esEdicion = (): boolean => this.producto() !== null;

  errorMsg = signal('');

  // Signals individuales por campo con getter/setter para ngModel
  private _nombre = signal('');
  private _precio = signal('');

  get prod_nombre(): string { return this._nombre(); }
  set prod_nombre(v: string) { this._nombre.set(v ?? ''); }

  get prod_precio(): string { return this._precio(); }
  set prod_precio(v: string) { this._precio.set(v ?? ''); }

  constructor() {
    // Poblar el formulario si es edición
    const prod = this.producto();
    if (prod) {
      this._nombre.set(prod.nombre);
      this._precio.set(String(prod.precio));
    }
  }

  // ─── Validación ───────────────────────────────────────────────────────────

  formValido(): boolean {
    return !!(
      this._nombre().trim() &&
      this._precio().trim() &&
      Number(this._precio()) >= 0
    );
  }

  // ─── Mutation ─────────────────────────────────────────────────────────────

  mutation = injectMutation(() => ({
    mutationFn: (payload: CreateProductoPayload | { id: number; data: UpdateProductoPayload }) => {
      if ('id' in payload) {
        return firstValueFrom(this.productoService.update(payload.id, payload.data));
      }
      return firstValueFrom(this.productoService.create(payload));
    },
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['productos'] });
      if (this.esEdicion()) {
        this.toast.success('Producto actualizado', 'Los datos fueron actualizados correctamente.');
      } else {
        this.toast.success('Producto creado', 'El producto fue creado correctamente.');
      }
      this.guardado.emit();
    },
    onError: () => {
      const msg = this.esEdicion()
        ? 'Error al actualizar el producto. Revisá los datos e intentá de nuevo.'
        : 'Error al crear el producto. Revisá los datos e intentá de nuevo.';
      this.errorMsg.set(msg);
      this.toast.error('No se pudo guardar', 'Revisá los datos e intentá de nuevo.');
    },
  }));

  // ─── Submit ───────────────────────────────────────────────────────────────

  submit(): void {
    if (!this.formValido()) return;

    this.errorMsg.set('');

    const data: UpdateProductoPayload = {
      prod_nombre: this._nombre().trim(),
      prod_precio: Number(this._precio()),
    };

    if (this.esEdicion()) {
      this.mutation.mutate({ id: this.producto()!.id, data });
    } else {
      this.mutation.mutate(data);
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrar.emit();
    }
  }
}
