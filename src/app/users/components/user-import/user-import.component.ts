import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { UsuarioService } from '../../services/usuario.service';
import { ButtonComponent, InputComponent, ToastService } from '../../../shared/components';
import { IconCloseComponent, IconExcelComponent, IconWarningComponent, IconCheckCircleComponent } from '../../../shared/icons';

@Component({
  selector: 'app-user-import',
  standalone: true,
  imports: [
    FormsModule,
    ButtonComponent,
    InputComponent,
    IconCloseComponent,
    IconExcelComponent,
    IconWarningComponent,
    IconCheckCircleComponent,
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
              <h2 class="text-lg font-bold text-surface-900">Importar Usuarios</h2>
              <p class="text-sm text-surface-500 mt-0.5">Cargá un archivo Excel con los datos</p>
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
        <div class="p-6 space-y-5">

          <!-- Resultado exitoso -->
          @if (resultado()) {
            <div class="flex items-start gap-3 p-4 bg-success-50 border border-success-200 rounded-lg
                        animate-[fadeIn_150ms_ease-out_both]">
              <app-icon-check-circle class="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
              <div>
                <p class="text-sm font-semibold text-success-800">Importación completada</p>
                <p class="text-sm text-success-700 mt-0.5">
                  {{ resultado()!.importados }} de {{ resultado()!.total }} usuarios importados.
                  @if (resultado()!.errores > 0) {
                    Se enviaron los errores a <strong>{{ emailReporte }}</strong>.
                  }
                </p>
              </div>
            </div>
          }

          <!-- Error general -->
          @if (errorMsg()) {
            <div class="flex items-start gap-3 p-3.5 bg-danger-50 border border-danger-200 rounded-lg
                        animate-[fadeIn_150ms_ease-out_both]">
              <app-icon-warning class="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-danger-700 leading-snug">{{ errorMsg() }}</p>
            </div>
          }

          <!-- Campo: email de reporte -->
          <app-input
            label="Correo para reporte de errores"
            type="email"
            placeholder="tu@correo.com"
            [required]="true"
            [(ngModel)]="emailReporte"
            name="email_reporte"
          />

          <!-- Zona de carga de archivo -->
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1.5">
              Archivo Excel <span class="text-danger-500">*</span>
            </label>
            <label
              class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed
                     rounded-xl cursor-pointer transition-colors"
              [class.border-surface-300]="!archivoSeleccionado()"
              [class.hover:border-primary-400]="!archivoSeleccionado()"
              [class.bg-surface-50]="!archivoSeleccionado()"
              [class.border-success-400]="archivoSeleccionado()"
              [class.bg-success-50]="archivoSeleccionado()"
            >
              <input
                type="file"
                accept=".xlsx,.xls"
                class="hidden"
                (change)="onArchivoChange($event)"
              />
              @if (archivoSeleccionado()) {
                <app-icon-excel class="w-8 h-8 text-success-500 mb-2" />
                <p class="text-sm font-medium text-success-700">{{ archivoSeleccionado()!.name }}</p>
                <p class="text-xs text-success-500 mt-0.5">
                  {{ (archivoSeleccionado()!.size / 1024).toFixed(1) }} KB — Click para cambiar
                </p>
              } @else {
                <app-icon-excel class="w-8 h-8 text-surface-400 mb-2" />
                <p class="text-sm font-medium text-surface-600">Arrastrá o hacé click para subir</p>
                <p class="text-xs text-surface-400 mt-0.5">Solo archivos .xlsx o .xls</p>
              }
            </label>
          </div>

        </div>

        <!-- Footer -->
        <div class="flex gap-3 p-6 pt-0">
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
            [loading]="cargando()"
            [disabled]="!puedeImportar()"
            (onClick)="importar()"
          >
            Importar
          </app-button>
        </div>
      </div>
    </div>
  `,
})
export class UserImportComponent {
  private readonly usuarioService = inject(UsuarioService);
  private readonly toast          = inject(ToastService);

  cerrar    = output<void>();
  importado = output<void>();

  // ─── Estado ──────────────────────────────────────────────────────────────

  archivoSeleccionado = signal<File | null>(null);
  cargando            = signal(false);
  errorMsg            = signal('');
  resultado           = signal<{ importados: number; errores: number; total: number } | null>(null);

  private _emailReporte = '';
  get emailReporte(): string { return this._emailReporte; }
  set emailReporte(v: string) { this._emailReporte = v; }

  puedeImportar(): boolean {
    return !!this.archivoSeleccionado() && !!this._emailReporte.trim() && !this.cargando();
  }

  // ─── Handlers ─────────────────────────────────────────────────────────────

  onArchivoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0] ?? null;
    this.archivoSeleccionado.set(file);
    this.errorMsg.set('');
    this.resultado.set(null);
  }

  async importar(): Promise<void> {
    const archivo = this.archivoSeleccionado();
    if (!archivo || !this._emailReporte.trim()) return;

    this.cargando.set(true);
    this.errorMsg.set('');
    this.resultado.set(null);

    try {
      const res = await firstValueFrom(
        this.usuarioService.importar(archivo, this._emailReporte.trim()),
      );

      this.resultado.set(res.data);

      if (res.data.errores === 0) {
        this.toast.success(
          'Importación exitosa',
          `${res.data.importados} usuarios importados correctamente.`,
        );
        this.importado.emit();
      } else {
        this.toast.warning(
          'Importación con errores',
          `${res.data.importados} importados, ${res.data.errores} con errores. Revisá tu correo.`,
        );
        this.importado.emit();
      }
    } catch {
      this.errorMsg.set('Error al procesar el archivo. Verificá que sea una planilla válida.');
    } finally {
      this.cargando.set(false);
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrar.emit();
    }
  }
}
