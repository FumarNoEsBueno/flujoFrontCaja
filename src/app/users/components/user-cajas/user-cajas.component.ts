import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';

import { UsuarioService } from '../../services/usuario.service';
import { CajaService } from '../../../movements/services/caja.service';
import type { AsignarCajaPayload, UsuarioCaja, UsuarioTabla } from '../../models';
import {
  BadgeComponent,
  ButtonComponent,
  ToastService,
} from '../../../shared/components';
import { CustomAutocompleteComponent } from '../../../shared/components/autocomplete/custom-autocomplete.component';
import type { AutocompleteOption } from '../../../shared/components';
import { IconCloseComponent, IconSpinnerComponent } from '../../../shared/icons';

@Component({
  selector: 'app-user-cajas',
  standalone: true,
  imports: [
    FormsModule,
    ButtonComponent,
    BadgeComponent,
    CustomAutocompleteComponent,
    IconCloseComponent,
    IconSpinnerComponent,
  ],
  template: `
    <!-- Overlay -->
    <div
      class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
      (click)="onOverlayClick($event)"
    >
      <!-- Panel modal -->
      <div
        class="bg-white rounded-xl shadow-modal w-full max-w-xl z-50
               animate-[modalIn_200ms_ease-out_both] flex flex-col max-h-[90vh]"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-surface-200 flex-shrink-0">
          <div>
            <h2 class="text-lg font-bold text-surface-900">Gestión de Cajas</h2>
            <p class="text-sm text-surface-500 mt-0.5">
              Cajas asignadas a <span class="font-medium text-surface-700">{{ usuario().nombre }}</span>
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

        <!-- Cuerpo scrolleable -->
        <div class="overflow-y-auto flex-1 p-6 space-y-6">

          <!-- ─── Cajas Asignadas ─────────────────────────────────────────── -->
          <section>
            <h3 class="text-sm font-semibold text-surface-700 uppercase tracking-wide mb-3">
              Cajas Asignadas
            </h3>

            @if (cajasQuery.isPending()) {
              <div class="flex items-center gap-2 text-surface-400 py-4">
                <app-icon-spinner class="w-4 h-4 animate-spin" />
                <span class="text-sm">Cargando cajas...</span>
              </div>
            } @else if (cajasAsignadas().length === 0) {
              <div class="text-center py-8 text-surface-400">
                <span class="text-4xl mb-2 block">🏧</span>
                <p class="text-sm">Este usuario no tiene cajas asignadas.</p>
              </div>
            } @else {
              <ul class="space-y-2">
                @for (caja of cajasAsignadas(); track caja.id) {
                  <li class="flex items-center justify-between p-3.5 bg-surface-50
                             border border-surface-100 rounded-lg">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-surface-900 truncate">
                        {{ caja.cajaNombre }}
                      </p>
                      <p class="text-xs text-surface-500">{{ caja.localNombre }}</p>
                    </div>
                    <div class="flex items-center gap-2 ml-3 flex-shrink-0">
                      @if (caja.habilitado) {
                        <app-badge variant="success">Habilitada</app-badge>
                      } @else {
                        <app-badge variant="warning">Deshabilitada</app-badge>
                      }
                      <app-button
                        variant="ghost"
                        size="sm"
                        [loading]="togglePendingId() === caja.cajaId"
                        (onClick)="toggle(caja)"
                      >
                        Toggle
                      </app-button>
                      <app-button
                        variant="danger"
                        size="sm"
                        [loading]="quitarPendingId() === caja.cajaId"
                        (onClick)="quitar(caja)"
                      >
                        Quitar
                      </app-button>
                    </div>
                  </li>
                }
              </ul>
            }
          </section>

          <!-- ─── Asignar Nueva Caja ──────────────────────────────────────── -->
          <section class="border-t border-surface-200 pt-6">
            <h3 class="text-sm font-semibold text-surface-700 uppercase tracking-wide mb-3">
              Asignar Nueva Caja
            </h3>

            <!-- Error al asignar -->
            @if (asignarMutation.isError()) {
              <div class="flex items-start gap-3 p-3.5 bg-danger-50 border border-danger-200
                          rounded-lg mb-3 animate-[fadeIn_150ms_ease-out_both]">
                <p class="text-sm text-danger-700">No se pudo asignar la caja. Intentá de nuevo.</p>
              </div>
            }

            <div class="flex gap-3 items-end">
              <div class="flex-1">
                <app-custom-autocomplete
                  label="Caja disponible"
                  placeholder="Buscar caja..."
                  [options]="cajasDisponibles()"
                  [(ngModel)]="cajaAAsignar"
                  name="cajaAsignar"
                />
              </div>
              <app-button
                variant="primary"
                [loading]="asignarMutation.isPending()"
                [disabled]="!cajaAAsignar"
                (onClick)="asignar()"
              >
                Asignar
              </app-button>
            </div>
          </section>

        </div>

        <!-- Footer -->
        <div class="flex justify-end p-6 pt-4 border-t border-surface-200 flex-shrink-0">
          <app-button variant="outline" (onClick)="cerrar.emit()">
            Cerrar
          </app-button>
        </div>
      </div>
    </div>
  `,
})
export class UserCajasComponent {
  private readonly usuarioService = inject(UsuarioService);
  private readonly cajaService    = inject(CajaService);
  private readonly queryClient    = injectQueryClient();
  private readonly toast          = inject(ToastService);

  // ─── Inputs / Outputs ────────────────────────────────────────────────────

  usuario = input.required<UsuarioTabla>();
  cerrar  = output<void>();

  // ─── Estado interno ───────────────────────────────────────────────────────

  togglePendingId = signal<number | null>(null);
  quitarPendingId = signal<number | null>(null);

  private _cajaAAsignar = signal<AutocompleteOption | null>(null);
  get cajaAAsignar(): AutocompleteOption | null { return this._cajaAAsignar(); }
  set cajaAAsignar(value: AutocompleteOption | null) { this._cajaAAsignar.set(value); }

  // ─── Query: cajas asignadas al usuario ────────────────────────────────────

  cajasQuery = injectQuery(() => ({
    queryKey: ['usuario-cajas', this.usuario().id],
    queryFn: () => firstValueFrom(this.usuarioService.getCajas(this.usuario().id)),
  }));

  cajasAsignadas = computed(
    () => this.cajasQuery.data()?.data ?? [],
  );

  // ─── Query: todas las cajas disponibles ──────────────────────────────────

  todasLasCajasQuery = injectQuery(() => ({
    queryKey: ['cajas-autocomplete'],
    queryFn: () => firstValueFrom(this.cajaService.autocomplete()),
  }));

  /** Cajas disponibles = todas las cajas menos las ya asignadas */
  cajasDisponibles = computed((): AutocompleteOption[] => {
    const todas      = this.todasLasCajasQuery.data()?.data ?? [];
    const asignadas  = this.cajasAsignadas().map((c) => c.cajaId);
    return todas
      .filter((c) => !asignadas.includes(c.id))
      .map((c) => ({ id: c.id, label: c.label }));
  });

  // ─── Invalidar queries de cajas ──────────────────────────────────────────

  private invalidarCajas(): void {
    this.queryClient.invalidateQueries({ queryKey: ['usuario-cajas', this.usuario().id] });
    this.queryClient.invalidateQueries({ queryKey: ['usuarios'] });
  }

  // ─── Mutation: asignar ────────────────────────────────────────────────────

  asignarMutation = injectMutation(() => ({
    mutationFn: (payload: AsignarCajaPayload) =>
      firstValueFrom(this.usuarioService.asignarCaja(this.usuario().id, payload)),
    onSuccess: () => {
      this.invalidarCajas();
      this._cajaAAsignar.set(null);
      this.toast.success('Caja asignada', 'La caja fue asignada al usuario correctamente.');
    },
    onError: () => {
      this.toast.error('No se pudo asignar', 'Ocurrió un error al asignar la caja.');
    },
  }));

  // ─── Mutation: quitar ─────────────────────────────────────────────────────

  quitarMutation = injectMutation(() => ({
    mutationFn: (cajaId: number) =>
      firstValueFrom(this.usuarioService.quitarCaja(this.usuario().id, cajaId)),
    onSuccess: () => {
      this.invalidarCajas();
      this.quitarPendingId.set(null);
      this.toast.success('Caja quitada', 'La caja fue removida del usuario.');
    },
    onError: () => {
      this.quitarPendingId.set(null);
      this.toast.error('No se pudo quitar', 'Ocurrió un error al quitar la caja.');
    },
  }));

  // ─── Mutation: toggle ─────────────────────────────────────────────────────

  toggleMutation = injectMutation(() => ({
    mutationFn: (cajaId: number) =>
      firstValueFrom(this.usuarioService.toggleCaja(this.usuario().id, cajaId)),
    onSuccess: () => {
      this.invalidarCajas();
      this.togglePendingId.set(null);
      this.toast.success('Estado actualizado', 'El estado de la caja fue actualizado.');
    },
    onError: () => {
      this.togglePendingId.set(null);
      this.toast.error('No se pudo actualizar', 'Ocurrió un error al cambiar el estado.');
    },
  }));

  // ─── Handlers ─────────────────────────────────────────────────────────────

  asignar(): void {
    const caja = this._cajaAAsignar();
    if (!caja) return;
    this.asignarMutation.mutate({ caja_id: Number(caja.id), usca_habilitado: true });
  }

  quitar(caja: UsuarioCaja): void {
    this.quitarPendingId.set(caja.cajaId);
    this.quitarMutation.mutate(caja.cajaId);
  }

  toggle(caja: UsuarioCaja): void {
    this.togglePendingId.set(caja.cajaId);
    this.toggleMutation.mutate(caja.cajaId);
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrar.emit();
    }
  }
}
