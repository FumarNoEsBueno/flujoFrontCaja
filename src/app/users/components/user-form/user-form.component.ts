import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';

import { UsuarioService } from '../../services/usuario.service';
import { RolService } from '../../services/rol.service';
import type { CreateUsuarioPayload, UpdateUsuarioPayload, UsuarioTabla } from '../../models';
import {
  ButtonComponent,
  InputComponent,
  RutInputComponent,
  ToastService,
} from '../../../shared/components';
import { CustomAutocompleteComponent } from '../../../shared/components/autocomplete/custom-autocomplete.component';
import type { AutocompleteOption } from '../../../shared/components';
import { IconCloseComponent, IconWarningComponent, IconSpinnerComponent } from '../../../shared/icons';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    FormsModule,
    ButtonComponent,
    InputComponent,
    RutInputComponent,
    CustomAutocompleteComponent,
    IconCloseComponent,
    IconWarningComponent,
    IconSpinnerComponent,
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
              <h2 class="text-lg font-bold text-surface-900">Editar Usuario</h2>
              <p class="text-sm text-surface-500 mt-0.5">Modificá los datos del usuario</p>
            } @else {
              <h2 class="text-lg font-bold text-surface-900">Nuevo Usuario</h2>
              <p class="text-sm text-surface-500 mt-0.5">Completá los datos del nuevo usuario</p>
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

            <!-- Loading detalle (edición) -->
            @if (esEdicion() && detalleQuery.isPending()) {
              <div class="flex items-center justify-center py-8 text-surface-400">
                <app-icon-spinner class="w-5 h-5 animate-spin mr-2" />
                Cargando datos...
              </div>
            }

            @if (!esEdicion() || !detalleQuery.isPending()) {
              <!-- Nombre -->
              <app-input
                label="Nombre"
                placeholder="Ej: Manuel"
                [required]="true"
                [(ngModel)]="usua_nombre"
                name="usua_nombre"
              />

              <!-- Apellido Paterno -->
              <app-input
                label="Apellido Paterno"
                placeholder="Ej: Pereira"
                [required]="true"
                [(ngModel)]="usua_apellido_p"
                name="usua_apellido_p"
              />

              <!-- Apellido Materno -->
              <app-input
                label="Apellido Materno"
                placeholder="Ej: Opazo (opcional)"
                [(ngModel)]="usua_apellido_m"
                name="usua_apellido_m"
              />

              <!-- RUT unificado con validación en tiempo real -->
              <app-rut-input
                label="RUT"
                placeholder="Ej: 20194802-9"
                [required]="true"
                [(ngModel)]="usua_rut"
                name="usua_rut"
              />

              <!-- Correo -->
              <app-input
                label="Correo electrónico"
                type="email"
                placeholder="Ej: usuario@mail.com (opcional)"
                [(ngModel)]="usua_correo"
                name="usua_correo"
              />

              <!-- Fecha de Nacimiento -->
              <app-input
                label="Fecha de Nacimiento"
                type="date"
                [required]="true"
                [(ngModel)]="usua_fecha_nac"
                name="usua_fecha_nac"
              />

              <!-- Contraseña -->
              @if (esEdicion()) {
                <app-input
                  label="Nueva Contraseña"
                  type="password"
                  placeholder="Dejá vacío para no cambiarla"
                  [(ngModel)]="usua_password"
                  name="usua_password"
                />
              } @else {
                <app-input
                  label="Contraseña"
                  type="password"
                  placeholder="Contraseña de acceso"
                  [required]="true"
                  [(ngModel)]="usua_password"
                  name="usua_password"
                />
              }

              <!-- Rol -->
              <app-custom-autocomplete
                label="Rol"
                placeholder="Seleccioná un rol..."
                [required]="true"
                [options]="rolesComoOpciones()"
                [(ngModel)]="rolSeleccionado"
                name="role_id"
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
export class UserFormComponent {
  private readonly usuarioService = inject(UsuarioService);
  private readonly rolService     = inject(RolService);
  private readonly queryClient    = injectQueryClient();
  private readonly toast          = inject(ToastService);

  // ─── Inputs ────────────────────────────────────────────────────────────────

  /** null = crear, non-null = editar */
  usuario = input<UsuarioTabla | null>(null);

  // ─── Outputs ───────────────────────────────────────────────────────────────

  cerrar  = output<void>();
  guardado = output<void>();

  // ─── Estado interno ───────────────────────────────────────────────────────

  esEdicion = computed(() => this.usuario() !== null);

  errorMsg = signal('');

  // Signals individuales por campo — ngModel necesita getter/setter para ser reactivo con signals
  private _nombre    = signal('');
  private _apellidoP = signal('');
  private _apellidoM = signal('');
  private _rut       = signal('');    // RUT completo "20194802-9"
  private _correo    = signal('');
  private _fechaNac  = signal('');
  private _password  = signal('');

  get usua_nombre():      string { return this._nombre();    }
  set usua_nombre(v:      string) { this._nombre.set(v ?? '');    }
  get usua_apellido_p():  string { return this._apellidoP(); }
  set usua_apellido_p(v:  string) { this._apellidoP.set(v ?? ''); }
  get usua_apellido_m():  string { return this._apellidoM(); }
  set usua_apellido_m(v:  string) { this._apellidoM.set(v ?? ''); }
  get usua_rut():         string { return this._rut();       }
  set usua_rut(v:         string) { this._rut.set(v ?? '');        }
  get usua_correo():      string { return this._correo();    }
  set usua_correo(v:      string) { this._correo.set(v ?? '');     }
  get usua_fecha_nac():   string { return this._fechaNac();  }
  set usua_fecha_nac(v:   string) { this._fechaNac.set(v ?? '');  }
  get usua_password():    string { return this._password();  }
  set usua_password(v:    string) { this._password.set(v ?? '');  }

  /** Resetea todos los campos del formulario */
  private resetForm(): void {
    this._nombre.set('');
    this._apellidoP.set('');
    this._apellidoM.set('');
    this._rut.set('');
    this._correo.set('');
    this._fechaNac.set('');
    this._password.set('');
  }

  // Rol como getter/setter para que ngModel sea reactivo con signals
  private _rolSeleccionado = signal<AutocompleteOption | null>(null);
  get rolSeleccionado(): AutocompleteOption | null { return this._rolSeleccionado(); }
  set rolSeleccionado(value: AutocompleteOption | null) { this._rolSeleccionado.set(value); }

  // ─── Query: detalle para edición ──────────────────────────────────────────

  detalleQuery = injectQuery(() => {
    const id = this.usuario()?.id ?? null;
    return {
      queryKey: ['usuario', id],
      queryFn: async () => {
        const res = await firstValueFrom(this.usuarioService.getById(id!));
        const detalle = res.data;

        // Poblar el formulario con los datos del detalle
        this._nombre.set(detalle.nombre);
        this._apellidoP.set(detalle.apellidoP);
        this._apellidoM.set(detalle.apellidoM ?? '');
        // El detalle ya trae el RUT completo "20194802-9" — RutInputComponent lo formatea
        this._rut.set(detalle.rut);
        this._correo.set(detalle.correo ?? '');
        this._fechaNac.set(detalle.fechaNac);
        this._password.set('');

        // Preseleccionar el rol
        this._rolSeleccionado.set({ id: detalle.roleId, label: detalle.rolNombre });

        return res;
      },
      enabled: !!id,
    };
  });

  // ─── Query: roles autocomplete ────────────────────────────────────────────

  rolesQuery = injectQuery(() => ({
    queryKey: ['roles-autocomplete'],
    queryFn: () => firstValueFrom(this.rolService.getRolesAutocomplete()),
  }));

  rolesComoOpciones = computed(
    () => (this.rolesQuery.data()?.data ?? []).map((r) => ({ id: r.id, label: r.nombre })),
  );

  // ─── Validación ───────────────────────────────────────────────────────────

  formValido(): boolean {
    const tieneRol = !!this._rolSeleccionado();
    const camposBase =
      this._nombre()?.trim() &&
      this._apellidoP()?.trim() &&
      this._rut()?.trim() &&
      this._fechaNac()?.trim() &&
      tieneRol;

    if (this.esEdicion()) {
      return !!camposBase;
    }
    return !!(camposBase && this._password()?.trim());
  }

  // ─── Mutation ─────────────────────────────────────────────────────────────

  mutation = injectMutation(() => ({
    mutationFn: (payload: CreateUsuarioPayload | { id: number; data: UpdateUsuarioPayload }) => {
      if ('id' in payload) {
        return firstValueFrom(this.usuarioService.update(payload.id, payload.data));
      }
      return firstValueFrom(this.usuarioService.create(payload));
    },
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      if (this.esEdicion()) {
        this.queryClient.invalidateQueries({ queryKey: ['usuario', this.usuario()!.id] });
        this.toast.success('Usuario actualizado', 'Los datos fueron actualizados correctamente.');
      } else {
        this.toast.success('Usuario creado', 'El usuario fue creado correctamente.');
      }
      this.guardado.emit();
    },
    onError: () => {
      const msg = this.esEdicion()
        ? 'Error al actualizar el usuario. Revisá los datos e intentá de nuevo.'
        : 'Error al crear el usuario. Revisá los datos e intentá de nuevo.';
      this.errorMsg.set(msg);
      this.toast.error('No se pudo guardar', 'Revisá los datos e intentá de nuevo.');
    },
  }));

  // ─── Submit ───────────────────────────────────────────────────────────────

  submit(): void {
    if (!this.formValido()) return;

    this.errorMsg.set('');
    const rol = this._rolSeleccionado()!;

    if (this.esEdicion()) {
      const data: UpdateUsuarioPayload = {
        usua_nombre:     this._nombre().trim(),
        usua_apellido_p: this._apellidoP().trim(),
        usua_apellido_m: this._apellidoM().trim() || null,
        usua_rut:        this._rut().trim(),
        usua_correo:     this._correo().trim() || null,
        usua_fecha_nac:  this._fechaNac(),
        role_id:         Number(rol.id),
      };
      // Solo incluir password si se ingresó algo
      if (this._password().trim()) {
        data.usua_password = this._password().trim();
      }
      this.mutation.mutate({ id: this.usuario()!.id, data });
    } else {
      const payload: CreateUsuarioPayload = {
        usua_nombre:     this._nombre().trim(),
        usua_apellido_p: this._apellidoP().trim(),
        usua_apellido_m: this._apellidoM().trim() || null,
        usua_rut:        this._rut().trim(),
        usua_correo:     this._correo().trim() || null,
        usua_fecha_nac:  this._fechaNac(),
        usua_password:   this._password().trim(),
        role_id:         Number(rol.id),
      };
      this.mutation.mutate(payload);
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrar.emit();
    }
  }
}
