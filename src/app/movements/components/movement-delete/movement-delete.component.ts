import { Component, inject, input, output } from '@angular/core';
import { injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';

import { MovimientoService } from '../../services/movimiento.service';
import type { Movimiento } from '../../models';
import { ButtonComponent, ToastService } from '../../../shared/components';

@Component({
  selector: 'app-movement-delete',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <!-- Overlay -->
    <div
      class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
      (click)="cerrar.emit()"
    >
      <!-- Modal con animación -->
      <div
        class="bg-white rounded-xl shadow-modal w-full max-w-md z-50
               animate-[modalIn_200ms_ease-out_both]"
        (click)="$event.stopPropagation()"
      >
        <div class="p-6">
          <!-- Ícono + título -->
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 rounded-full bg-danger-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-danger-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-bold text-surface-900">Eliminar Movimiento</h2>
              <p class="text-sm text-surface-500">Esta acción no se puede deshacer.</p>
            </div>
          </div>

          <!-- Resumen del movimiento -->
          <div class="bg-surface-50 rounded-lg p-3.5 mb-5 border border-surface-100">
            <p class="text-sm text-surface-700">
              ¿Estás seguro de que querés eliminar
              <span class="font-semibold text-surface-900">"{{ movimiento().descripcion }}"</span>
              por
              <span class="font-semibold text-surface-900">$ {{ movimiento().montoTotal }}</span>?
            </p>
          </div>

          <!-- Error inline mejorado -->
          @if (mutation.isError()) {
            <div class="flex items-start gap-3 p-3.5 bg-danger-50 border border-danger-200
                        rounded-lg mb-5 animate-[fadeIn_150ms_ease-out_both]">
              <div class="flex-shrink-0 w-5 h-5 mt-0.5 text-danger-500">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
              <p class="text-sm text-danger-700 leading-snug">
                No se pudo eliminar el movimiento. Intentá de nuevo.
              </p>
            </div>
          }

          <!-- Acciones -->
          <div class="flex gap-3">
            <app-button
              variant="outline"
              [fullWidth]="true"
              (onClick)="cerrar.emit()"
              [disabled]="mutation.isPending()"
            >
              Cancelar
            </app-button>
            <app-button
              variant="danger"
              [fullWidth]="true"
              [loading]="mutation.isPending()"
              (onClick)="confirmar()"
            >
              Sí, eliminar
            </app-button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MovementDeleteComponent {
  private readonly movimientoService = inject(MovimientoService);
  private readonly queryClient = injectQueryClient();
  private readonly toast = inject(ToastService);

  movimiento = input.required<Movimiento>();
  cerrar     = output<void>();
  eliminado  = output<void>();

  mutation = injectMutation(() => ({
    mutationFn: (id: number) =>
      this.movimientoService.delete(id).toPromise(),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      this.toast.success('Movimiento eliminado', 'El registro fue eliminado correctamente.');
      this.eliminado.emit();
    },
    onError: () => {
      this.toast.error('No se pudo eliminar', 'Ocurrió un error al intentar eliminar el movimiento.');
    },
  }));

  confirmar(): void {
    this.mutation.mutate(this.movimiento().id);
  }
}
