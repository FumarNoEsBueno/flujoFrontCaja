import { Component, inject, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  injectQuery,
  injectMutation,
} from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';

import { PerfilService } from '../../services/perfil.service';
import type { PerfilData, UpdateCorreoPayload, UpdatePasswordPayload } from '../../models';
import { AuthStore } from '../../../auth/store';
import {
  PageHeaderComponent,
  CardComponent,
  ButtonComponent,
  InputComponent,
  ToastService,
} from '../../../shared/components';
import { IconWarningComponent } from '../../../shared/icons';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [
    FormsModule,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    InputComponent,
    IconWarningComponent,
  ],
  template: `
    <app-page-header
      title="Mi Perfil"
      subtitle="Consultá y actualizá tus datos personales"
    />

    @if (perfilQuery.isPending()) {
      <div class="flex justify-center items-center py-24 text-surface-400">
        <svg class="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    } @else if (perfilQuery.isError()) {
      <div class="p-6 bg-danger-50 border border-danger-200 rounded-xl text-danger-700 text-sm">
        No se pudo cargar el perfil. Intentá recargar la página.
      </div>
    } @else {
      <div class="grid gap-6 max-w-2xl">

        <!-- ── Card: Datos personales (solo lectura) ────────────────────── -->
        <app-card title="Datos personales">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <p class="text-xs font-medium text-surface-500 uppercase tracking-wide mb-1">Nombre completo</p>
              <p class="text-sm font-medium text-surface-900">{{ nombreCompleto() }}</p>
            </div>

            <div>
              <p class="text-xs font-medium text-surface-500 uppercase tracking-wide mb-1">RUT</p>
              <p class="text-sm font-medium text-surface-900">{{ rut() }}</p>
            </div>

            <div>
              <p class="text-xs font-medium text-surface-500 uppercase tracking-wide mb-1">Rol</p>
              <p class="text-sm font-medium text-surface-900">{{ perfilQuery.data()?.data?.rolNombre || authStore.userRole() || '—' }}</p>
            </div>

            <div>
              <p class="text-xs font-medium text-surface-500 uppercase tracking-wide mb-1">Correo</p>
              <p class="text-sm font-medium text-surface-900">{{ perfilQuery.data()?.data?.correo ?? '—' }}</p>
            </div>

          </div>
        </app-card>

        <!-- ── Card: Correo electrónico ─────────────────────────────────── -->
        <app-card title="Correo electrónico">
          <form (ngSubmit)="submitCorreo()" class="space-y-4">

            @if (correoErrorMsg()) {
              <div class="flex items-start gap-3 p-3.5 bg-danger-50 border border-danger-200 rounded-lg">
                <app-icon-warning class="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
                <p class="text-sm text-danger-700 leading-snug">{{ correoErrorMsg() }}</p>
              </div>
            }

            <app-input
              label="Correo electrónico"
              [(ngModel)]="_correo"
              name="correo"
              type="email"
              placeholder="correo@ejemplo.com"
            />

            <div class="flex justify-end">
              <app-button
                type="submit"
                variant="primary"
                [loading]="correoMutation.isPending()"
                [disabled]="!correoValido()"
              >
                Guardar correo
              </app-button>
            </div>

          </form>
        </app-card>

        <!-- ── Card: Cambiar contraseña ────────────────────────────────── -->
        <app-card title="Cambiar contraseña">
          <form (ngSubmit)="submitPassword()" class="space-y-4">

            @if (passwordErrorMsg()) {
              <div class="flex items-start gap-3 p-3.5 bg-danger-50 border border-danger-200 rounded-lg">
                <app-icon-warning class="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
                <p class="text-sm text-danger-700 leading-snug">{{ passwordErrorMsg() }}</p>
              </div>
            }

            <app-input
              label="Contraseña actual"
              [(ngModel)]="_passwordActual"
              name="password_actual"
              type="password"
              placeholder="Tu contraseña actual"
            />

            <app-input
              label="Nueva contraseña"
              [(ngModel)]="_passwordNuevo"
              name="password_nuevo"
              type="password"
              placeholder="Mínimo 8 caracteres"
            />

            <app-input
              label="Confirmar nueva contraseña"
              [(ngModel)]="_passwordConfirmacion"
              name="password_nuevo_confirmation"
              type="password"
              placeholder="Repetí la nueva contraseña"
            />

            <div class="flex justify-end">
              <app-button
                type="submit"
                variant="primary"
                [loading]="passwordMutation.isPending()"
                [disabled]="!passwordValido()"
              >
                Cambiar contraseña
              </app-button>
            </div>

          </form>
        </app-card>

      </div>
    }
  `,
})
export class PerfilPageComponent {

  // ─── Dependencias ─────────────────────────────────────────────────────────

  private readonly perfilService = inject(PerfilService);
  private readonly toast = inject(ToastService);
  readonly authStore = inject(AuthStore);

  constructor() {
    // Inicializar el correo con el valor del store una vez que esté disponible
    effect(() => {
      const correo = this.authStore.usuario()?.usua_correo ?? '';
      if (correo && !this._correo()) {
        this._correo.set(correo);
      }
    });
  }

  // ─── Query ────────────────────────────────────────────────────────────────

  perfilQuery = injectQuery(() => ({
    queryKey: ['perfil'],
    queryFn: () => firstValueFrom(this.perfilService.getPerfil()),
  }));

  // ─── Computed: datos personales ───────────────────────────────────────────

  nombreCompleto = computed(() => {
    const u = this.perfilQuery.data()?.data;
    return u?.nombre ?? '—';
  });

  rut = computed(() => {
    const u = this.perfilQuery.data()?.data;
    return u?.rut ?? '—';
  });

  // ─── Estado: correo ───────────────────────────────────────────────────────

  _correo = signal('');
  correoErrorMsg = signal('');

  correoValido = computed(() => {
    const v = this._correo().trim();
    return v.length > 0 && v.includes('@');
  });

  correoMutation = injectMutation(() => ({
    mutationFn: (payload: UpdateCorreoPayload) =>
      firstValueFrom(this.perfilService.updateCorreo(payload)),
    onSuccess: () => {
      this.toast.success('Correo actualizado', 'Tu correo fue actualizado correctamente.');
      this.correoErrorMsg.set('');
    },
    onError: () => {
      this.correoErrorMsg.set('No se pudo actualizar el correo. Verificá que sea válido y no esté en uso.');
    },
  }));

  submitCorreo(): void {
    if (!this.correoValido()) return;
    this.correoErrorMsg.set('');
    this.correoMutation.mutate({ usua_correo: this._correo().trim() });
  }

  // ─── Estado: password ─────────────────────────────────────────────────────

  _passwordActual = signal('');
  _passwordNuevo = signal('');
  _passwordConfirmacion = signal('');
  passwordErrorMsg = signal('');

  passwordValido = computed(() => {
    const actual = this._passwordActual().trim();
    const nuevo  = this._passwordNuevo().trim();
    const conf   = this._passwordConfirmacion().trim();
    return actual.length > 0 && nuevo.length >= 8 && nuevo === conf;
  });

  passwordMutation = injectMutation(() => ({
    mutationFn: (payload: UpdatePasswordPayload) =>
      firstValueFrom(this.perfilService.updatePassword(payload)),
    onSuccess: () => {
      this._passwordActual.set('');
      this._passwordNuevo.set('');
      this._passwordConfirmacion.set('');
      this.passwordErrorMsg.set('');
      this.toast.success('Contraseña actualizada', 'Tu contraseña fue cambiada correctamente.');
    },
    onError: (error: unknown) => {
      const httpError = error as { error?: { message?: string } };
      const msg = httpError?.error?.message ?? 'No se pudo cambiar la contraseña. Verificá que la contraseña actual sea correcta.';
      this.passwordErrorMsg.set(msg);
    },
  }));

  submitPassword(): void {
    if (!this.passwordValido()) return;
    this.passwordErrorMsg.set('');

    if (this._passwordNuevo().trim() !== this._passwordConfirmacion().trim()) {
      this.passwordErrorMsg.set('Las contraseñas no coinciden.');
      return;
    }

    this.passwordMutation.mutate({
      password_actual: this._passwordActual().trim(),
      password_nuevo: this._passwordNuevo().trim(),
      password_nuevo_confirmation: this._passwordConfirmacion().trim(),
    });
  }
}
