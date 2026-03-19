import { Component, inject, input, output } from '@angular/core';
import { injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';

import { UsuarioService } from '../../services/usuario.service';
import type { UsuarioTabla } from '../../models';
import { ButtonComponent, ToastService } from '../../../shared/components';
import { IconWarningComponent, IconCloseComponent } from '../../../shared/icons';

@Component({
  selector: 'app-user-delete',
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
              <h2 class="text-lg font-bold text-surface-900">Eliminar Usuario</h2>
              <p class="text-sm text-surface-500">Esta acción no se puede deshacer.</p>
            </div>
          </div>

          <!-- Resumen del usuario -->
          <div class="bg-surface-50 rounded-lg p-3.5 mb-5 border border-surface-100">
            <p class="text-sm text-surface-700">
              ¿Estás seguro de que querés eliminar al usuario
              <span class="font-semibold text-surface-900">{{ usuario().nombre }}</span>
              ({{ usuario().rut }})?
            </p>
          </div>

          <!-- Error inline -->
          @if (mutation.isError()) {
            <div class="flex items-start gap-3 p-3.5 bg-danger-50 border border-danger-200
                        rounded-lg mb-5 animate-[fadeIn_150ms_ease-out_both]">
              <div class="flex-shrink-0 w-5 h-5 mt-0.5 text-danger-500">
                <app-icon-close class="w-5 h-5" />
              </div>
              <p class="text-sm text-danger-700 leading-snug">
                No se pudo eliminar el usuario. Intentá de nuevo.
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
export class UserDeleteComponent {
  private readonly usuarioService = inject(UsuarioService);
  private readonly queryClient    = injectQueryClient();
  private readonly toast          = inject(ToastService);

  usuario  = input.required<UsuarioTabla>();
  cerrar   = output<void>();
  eliminado = output<void>();

  mutation = injectMutation(() => ({
    mutationFn: (id: number) =>
      firstValueFrom(this.usuarioService.delete(id)),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      this.toast.success('Usuario eliminado', 'El usuario fue eliminado correctamente.');
      this.eliminado.emit();
    },
    onError: () => {
      this.toast.error('No se pudo eliminar', 'Ocurrió un error al intentar eliminar el usuario.');
    },
  }));

  confirmar(): void {
    this.mutation.mutate(this.usuario().id);
  }
}
