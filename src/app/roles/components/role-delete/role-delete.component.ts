import { Component, inject, input, output } from '@angular/core';
import { injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';

import { RolService } from '../../services/rol.service';
import type { RolTabla } from '../../models';
import { ButtonComponent, ToastService } from '../../../shared/components';
import { IconCloseComponent, IconWarningComponent } from '../../../shared/icons';

@Component({
  selector: 'app-role-delete',
  standalone: true,
  imports: [ButtonComponent, IconWarningComponent, IconCloseComponent],
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
              <app-icon-warning class="w-6 h-6 text-danger-600" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-surface-900">Eliminar Rol</h2>
              <p class="text-sm text-surface-500">Esta acción no se puede deshacer.</p>
            </div>
          </div>

          <!-- Resumen del rol -->
          <div class="bg-surface-50 rounded-lg p-3.5 mb-5 border border-surface-100">
            <p class="text-sm text-surface-700">
              ¿Estás seguro de que querés eliminar el rol
              <span class="font-semibold text-surface-900">{{ rol().nombre }}</span>?
            </p>
            @if (rol().permisos.length > 0) {
              <p class="text-xs text-surface-500 mt-1">
                Se desasignarán {{ rol().permisos.length }} permiso{{ rol().permisos.length !== 1 ? 's' : '' }}.
              </p>
            }
          </div>

          <!-- Error inline -->
          @if (mutation.isError()) {
            <div class="flex items-start gap-3 p-3.5 bg-danger-50 border border-danger-200
                        rounded-lg mb-5 animate-[fadeIn_150ms_ease-out_both]">
              <app-icon-close class="w-5 h-5 flex-shrink-0 mt-0.5 text-danger-500" />
              <p class="text-sm text-danger-700 leading-snug">
                No se pudo eliminar el rol. Intentá de nuevo.
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
export class RoleDeleteComponent {
  private readonly rolService  = inject(RolService);
  private readonly queryClient = injectQueryClient();
  private readonly toast       = inject(ToastService);

  rol      = input.required<RolTabla>();
  cerrar   = output<void>();
  eliminado = output<void>();

  mutation = injectMutation(() => ({
    mutationFn: (id: number) =>
      firstValueFrom(this.rolService.delete(id)),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['roles'] });
      this.toast.success('Rol eliminado', 'El rol fue eliminado correctamente.');
      this.eliminado.emit();
    },
    onError: () => {
      this.toast.error('No se pudo eliminar', 'Ocurrió un error al intentar eliminar el rol.');
    },
  }));

  confirmar(): void {
    this.mutation.mutate(this.rol().id);
  }
}
