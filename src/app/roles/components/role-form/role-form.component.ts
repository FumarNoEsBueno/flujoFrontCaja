import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';

import { RolService } from '../../services/rol.service';
import type { CreateRolPayload, PermisoOption, RolTabla, UpdateRolPayload } from '../../models';
import {
  ButtonComponent,
  InputComponent,
  MultiAutocompleteComponent,
  ToastService,
} from '../../../shared/components';
import type { AutocompleteOption } from '../../../shared/components';
import { IconCloseComponent, IconWarningComponent } from '../../../shared/icons';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function permisoToOption(p: PermisoOption): AutocompleteOption {
  return { id: p.id, label: p.nombre };
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [
    FormsModule,
    ButtonComponent,
    InputComponent,
    MultiAutocompleteComponent,
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
        class="bg-white rounded-xl shadow-modal w-full max-w-lg z-50
               animate-[modalIn_200ms_ease-out_both] flex flex-col max-h-[90vh]"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-surface-200 flex-shrink-0">
          <div>
            @if (esEdicion()) {
              <h2 class="text-lg font-bold text-surface-900">Editar Rol</h2>
              <p class="text-sm text-surface-500 mt-0.5">Modificá el nombre y los permisos del rol</p>
            } @else {
              <h2 class="text-lg font-bold text-surface-900">Nuevo Rol</h2>
              <p class="text-sm text-surface-500 mt-0.5">Definí el nombre y asigná los permisos</p>
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
          <div class="overflow-y-auto flex-1 p-6 space-y-5">

            <!-- Error inline -->
            @if (errorMsg()) {
              <div class="flex items-start gap-3 p-3.5 bg-danger-50 border border-danger-200
                          rounded-lg animate-[fadeIn_150ms_ease-out_both]">
                <app-icon-warning class="w-5 h-5 flex-shrink-0 mt-0.5 text-danger-500" />
                <p class="text-sm text-danger-700 leading-snug">{{ errorMsg() }}</p>
              </div>
            }

            <!-- Nombre -->
            <app-input
              label="Nombre del rol"
              placeholder="Ej: Supervisor"
              [required]="true"
              [(ngModel)]="role_nombre"
              name="role_nombre"
            />

            <!-- ─── Permisos ──────────────────────────────────────────── -->
            @if (catalogoIsPending()) {
              <div class="text-sm text-surface-400 text-center py-4">Cargando permisos...</div>
            } @else if (catalogoIsError()) {
              <div class="text-sm text-danger-600 text-center py-4">Error al cargar los permisos</div>
            } @else {
              <app-multi-autocomplete
                label="Permisos asignados"
                placeholder="Buscar permiso..."
                [options]="opcionesDisponibles()"
                [(ngModel)]="permisosSeleccionados"
                name="permisos"
              />
            }

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
export class RoleFormComponent {
  private readonly rolService  = inject(RolService);
  private readonly queryClient = injectQueryClient();
  private readonly toast       = inject(ToastService);

  // ─── Inputs ────────────────────────────────────────────────────────────────

  /** null = crear, non-null = editar */
  rol = input<RolTabla | null>(null);

  // ─── Outputs ───────────────────────────────────────────────────────────────

  cerrar   = output<void>();
  guardado = output<void>();

  // ─── Estado interno ────────────────────────────────────────────────────────

  esEdicion = (): boolean => this.rol() !== null;

  errorMsg = signal('');

  // Campos del formulario con getter/setter para ngModel
  private _nombre = signal('');

  get role_nombre(): string { return this._nombre(); }
  set role_nombre(v: string) { this._nombre.set(v ?? ''); }

  // Permisos seleccionados como AutocompleteOption[] para el CVA del multi-autocomplete
  private _permisosSeleccionados = signal<AutocompleteOption[]>([]);

  get permisosSeleccionados(): AutocompleteOption[] { return this._permisosSeleccionados(); }
  set permisosSeleccionados(v: AutocompleteOption[]) { this._permisosSeleccionados.set(v ?? []); }

  constructor() {
    const rolActual = this.rol();
    if (rolActual) {
      this._nombre.set(rolActual.nombre);
    }

    // Pre-poblar los permisos seleccionados cuando llegan los datos del detalle
    effect(() => {
      const data = this.rolDetalleQuery.data();
      if (!data) return;
      const activos = (data.data.todos_los_permisos ?? [])
        .filter((p) => data.data.permisos.some((a) => a.id === p.id))
        .map(permisoToOption);
      this._permisosSeleccionados.set(activos);
    });
  }

  // ─── Query edición: GET /roles/{id} — trae permisos activos + catálogo ────

  private readonly _rolId = computed(() => this.rol()?.id ?? 0);

  rolDetalleQuery = injectQuery(() => ({
    queryKey: ['roles', this._rolId()],
    queryFn: () => firstValueFrom(this.rolService.getById(this._rolId())),
    enabled: this.esEdicion(),
  }));

  // ─── Query creación: GET /roles/permisos — catálogo completo ─────────────

  permisosQuery = injectQuery(() => ({
    queryKey: ['permisos-disponibles'],
    queryFn: () => firstValueFrom(this.rolService.getPermisos()),
    enabled: !this.esEdicion(),
  }));

  // ─── Estados derivados ────────────────────────────────────────────────────

  catalogoIsPending = computed(() =>
    this.esEdicion() ? this.rolDetalleQuery.isPending() : this.permisosQuery.isPending(),
  );

  catalogoIsError = computed(() =>
    this.esEdicion() ? this.rolDetalleQuery.isError() : this.permisosQuery.isError(),
  );

  /** Opciones disponibles para el multi-autocomplete */
  opcionesDisponibles = computed<AutocompleteOption[]>(() => {
    if (this.esEdicion()) {
      const data = this.rolDetalleQuery.data();
      if (!data) return [];
      return (data.data.todos_los_permisos ?? []).map(permisoToOption);
    }

    const data = this.permisosQuery.data();
    if (!data) return [];
    return (data.data ?? []).map(permisoToOption);
  });

  // ─── Validación ───────────────────────────────────────────────────────────

  formValido(): boolean {
    return !!this._nombre().trim();
  }

  // ─── Mutation ─────────────────────────────────────────────────────────────

  mutation = injectMutation(() => ({
    mutationFn: (payload: CreateRolPayload | { id: number; data: UpdateRolPayload }) => {
      if ('id' in payload) {
        return firstValueFrom(this.rolService.update(payload.id, payload.data));
      }
      return firstValueFrom(this.rolService.create(payload));
    },
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['roles'] });
      if (this.esEdicion()) {
        this.toast.success('Rol actualizado', 'Los datos fueron actualizados correctamente.');
      } else {
        this.toast.success('Rol creado', 'El rol fue creado correctamente.');
      }
      this.guardado.emit();
    },
    onError: () => {
      const msg = this.esEdicion()
        ? 'Error al actualizar el rol. Revisá los datos e intentá de nuevo.'
        : 'Error al crear el rol. Revisá los datos e intentá de nuevo.';
      this.errorMsg.set(msg);
      this.toast.error('No se pudo guardar', 'Revisá los datos e intentá de nuevo.');
    },
  }));

  // ─── Submit ───────────────────────────────────────────────────────────────

  submit(): void {
    if (!this.formValido()) return;

    this.errorMsg.set('');

    const data: UpdateRolPayload = {
      role_nombre: this._nombre().trim(),
      perm_ids: this._permisosSeleccionados().map((o) => Number(o.id)),
    };

    if (this.esEdicion()) {
      this.mutation.mutate({ id: this.rol()!.id, data });
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
