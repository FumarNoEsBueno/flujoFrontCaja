import { Component, inject, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { UsuarioService } from '../../services/usuario.service';
import { RolService } from '../../services/rol.service';
import { ButtonComponent, ToastService } from '../../../shared/components';
import { CustomAutocompleteComponent } from '../../../shared/components/autocomplete/custom-autocomplete.component';
import type { AutocompleteOption } from '../../../shared/components/autocomplete/custom-autocomplete.component';
import { IconCloseComponent, IconExcelComponent } from '../../../shared/icons';

@Component({
  selector: 'app-user-export',
  standalone: true,
  imports: [
    FormsModule,
    ButtonComponent,
    CustomAutocompleteComponent,
    IconCloseComponent,
    IconExcelComponent,
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
               animate-[modalIn_200ms_ease-out_both] flex flex-col"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-surface-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center flex-shrink-0">
              <app-icon-excel class="w-5 h-5 text-success-600" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-surface-900">Exportar Usuarios</h2>
              <p class="text-sm text-surface-500 mt-0.5">Configurá el Excel que querés generar</p>
            </div>
          </div>
          <button
            (click)="cerrar.emit()"
            class="text-surface-400 hover:text-surface-700 transition-colors cursor-pointer
                   rounded-lg p-1 hover:bg-surface-100"
          >
            <app-icon-close class="w-5 h-5" />
          </button>
        </div>

        <!-- Cuerpo -->
        <div class="p-6 space-y-5 overflow-y-auto">

          <!-- Sección: Filtros -->
          <div>
            <p class="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">
              Filtros
            </p>
            <div class="space-y-3">

              <!-- Nombre -->
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-surface-600 uppercase tracking-wide">
                  Nombre
                </label>
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  [(ngModel)]="filtroNombre"
                  name="filtroNombre"
                  class="px-3.5 py-2.5 bg-white border border-surface-300 rounded-lg text-surface-900
                         placeholder:text-surface-400 text-sm focus:outline-none focus:ring-2
                         focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>

              <!-- RUT -->
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-surface-600 uppercase tracking-wide">
                  RUT
                </label>
                <input
                  type="text"
                  placeholder="Ej: 20194802"
                  [(ngModel)]="filtroRut"
                  name="filtroRut"
                  class="px-3.5 py-2.5 bg-white border border-surface-300 rounded-lg text-surface-900
                         placeholder:text-surface-400 text-sm focus:outline-none focus:ring-2
                         focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>

              <!-- Rol (autocomplete) -->
              <app-custom-autocomplete
                label="Rol"
                placeholder="Todos los roles..."
                [options]="rolesComoOpciones()"
                [(ngModel)]="filtroRolValue"
                name="filtroRol"
              />

            </div>
          </div>

          <div class="border-t border-surface-100"></div>

          <!-- Sección: Orden -->
          <div>
            <p class="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">
              Ordenar por
            </p>
            <div class="flex gap-3">

              <!-- Primeros registros -->
              <label
                class="flex items-center gap-2.5 flex-1 border rounded-lg px-4 py-3 cursor-pointer
                       transition-colors"
                [class.border-primary-500]="orden === 'asc'"
                [class.bg-primary-50]="orden === 'asc'"
                [class.border-surface-200]="orden !== 'asc'"
              >
                <input
                  type="radio"
                  name="orden"
                  value="asc"
                  [(ngModel)]="orden"
                  class="accent-primary-600"
                />
                <div>
                  <p class="text-sm font-medium text-surface-800">Primeros registros</p>
                  <p class="text-xs text-surface-500">Del más antiguo al más nuevo</p>
                </div>
              </label>

              <!-- Últimos registros -->
              <label
                class="flex items-center gap-2.5 flex-1 border rounded-lg px-4 py-3 cursor-pointer
                       transition-colors"
                [class.border-primary-500]="orden === 'desc'"
                [class.bg-primary-50]="orden === 'desc'"
                [class.border-surface-200]="orden !== 'desc'"
              >
                <input
                  type="radio"
                  name="orden"
                  value="desc"
                  [(ngModel)]="orden"
                  class="accent-primary-600"
                />
                <div>
                  <p class="text-sm font-medium text-surface-800">Últimos registros</p>
                  <p class="text-xs text-surface-500">Del más nuevo al más antiguo</p>
                </div>
              </label>

            </div>
          </div>

          <div class="border-t border-surface-100"></div>

          <!-- Sección: Cantidad -->
          <div>
            <p class="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">
              Cantidad de registros
            </p>

            <!-- Checkbox todos -->
            <label class="flex items-center gap-3 mb-4 cursor-pointer group">
              <input
                type="checkbox"
                [(ngModel)]="exportarTodos"
                name="exportarTodos"
                class="w-4 h-4 rounded accent-primary-600 cursor-pointer"
              />
              <span class="text-sm font-medium text-surface-700 group-hover:text-surface-900 transition-colors">
                Exportar todos los registros
              </span>
            </label>

            <!-- Input cantidad (visible solo si no es "todos") -->
            @if (!exportarTodos) {
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-surface-600 uppercase tracking-wide">
                  Cantidad <span class="text-danger-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Ej: 100"
                  [(ngModel)]="cantidadRegistros"
                  name="cantidadRegistros"
                  min="1"
                  max="10000"
                  class="px-3.5 py-2.5 bg-white border rounded-lg text-surface-900
                         placeholder:text-surface-400 text-sm focus:outline-none focus:ring-2
                         focus:ring-primary-500 transition-colors"
                  [class.border-danger-400]="mostrarErrorCantidad()"
                  [class.border-surface-300]="!mostrarErrorCantidad()"
                />
                @if (mostrarErrorCantidad()) {
                  <p class="text-xs text-danger-500 mt-0.5">
                    Ingresá una cantidad válida entre 1 y 10.000.
                  </p>
                }
              </div>
            }

          </div>

        </div>

        <!-- Footer -->
        <div class="flex gap-3 p-6 pt-0 border-t border-surface-100 mt-2">
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
            type="button"
            [loading]="exportando()"
            [disabled]="!puedeExportar()"
            (onClick)="exportar()"
          >
            Exportar Excel
          </app-button>
        </div>
      </div>
    </div>
  `,
})
export class UserExportComponent {
  private readonly usuarioService = inject(UsuarioService);
  private readonly rolService     = inject(RolService);
  private readonly toast          = inject(ToastService);

  cerrar = output<void>();

  // ─── Estado de roles (autocomplete) ─────────────────────────────────────

  private readonly rolesQuery = (() => {
    // Carga los roles una sola vez al inicializar el componente
    const data = signal<AutocompleteOption[]>([]);
    firstValueFrom(this.rolService.getRolesAutocomplete()).then((res) => {
      data.set(res.data.map((r) => ({ id: r.id, label: r.nombre })));
    }).catch(() => {/* silencioso — el autocomplete queda vacío */});
    return data;
  })();

  rolesComoOpciones = computed(() => this.rolesQuery());

  // ─── Estado del formulario ───────────────────────────────────────────────

  filtroNombre      = '';
  filtroRut         = '';
  filtroRol         = signal<AutocompleteOption | null>(null);
  orden             = 'asc';
  exportarTodos     = false;
  cantidadRegistros: number | null = null;

  // ngModel no soporta signal directamente — usamos getter/setter para filtroRol
  get filtroRolValue(): AutocompleteOption | null { return this.filtroRol(); }
  set filtroRolValue(v: AutocompleteOption | null) { this.filtroRol.set(v); }

  // ─── Estado de carga ─────────────────────────────────────────────────────

  exportando       = signal(false);
  intentoExportar  = signal(false);

  // ─── Validaciones ────────────────────────────────────────────────────────

  mostrarErrorCantidad = computed(() =>
    this.intentoExportar() &&
    !this.exportarTodos &&
    (this.cantidadRegistros === null || this.cantidadRegistros < 1 || this.cantidadRegistros > 10000)
  );

  puedeExportar(): boolean {
    if (this.exportando()) return false;
    if (!this.exportarTodos) {
      return (
        this.cantidadRegistros !== null &&
        this.cantidadRegistros >= 1 &&
        this.cantidadRegistros <= 10000
      );
    }
    return true;
  }

  // ─── Handlers ────────────────────────────────────────────────────────────

  async exportar(): Promise<void> {
    this.intentoExportar.set(true);
    if (!this.puedeExportar()) return;

    this.exportando.set(true);
    try {
      const blob = await firstValueFrom(
        this.usuarioService.exportar({
          nombre:  this.filtroNombre.trim() || undefined,
          rut:     this.filtroRut.trim() || undefined,
          role_id: this.filtroRol() ? Number(this.filtroRol()!.id) : undefined,
          orden:   this.orden as 'asc' | 'desc',
          todos:   this.exportarTodos,
          limite:  this.exportarTodos ? undefined : (this.cantidadRegistros ?? undefined),
        }),
      );

      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `usuarios_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);

      this.toast.success('Excel generado', 'La descarga comenzó correctamente.');
      this.cerrar.emit();
    } catch (err) {
      console.error('[UserExport]', err);
      this.toast.error('Error al exportar', 'No se pudo generar el Excel. Intentá de nuevo.');
    } finally {
      this.exportando.set(false);
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrar.emit();
    }
  }
}
