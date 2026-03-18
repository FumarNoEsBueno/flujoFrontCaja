import { Component, inject, input, output, signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';

import { MovimientoService } from '../../services/movimiento.service';
import { ButtonComponent, BadgeComponent, LoadingComponent } from '../../../shared/components';

@Component({
  selector: 'app-movement-detail',
  standalone: true,
  imports: [ButtonComponent, BadgeComponent, LoadingComponent],
  template: `
    <!-- Overlay -->
    <div
      class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
      (click)="cerrar.emit()"
    >
      <div
        class="bg-white rounded-xl shadow-xl w-full max-w-lg z-50 flex flex-col max-h-[90vh]
               animate-[modalIn_200ms_ease-out_both]"
        (click)="$event.stopPropagation()"
      >

        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-surface-200 flex-shrink-0">
          <div>
            <h2 class="text-lg font-bold text-surface-900">Detalle del Movimiento</h2>
            @if (movimiento()) {
              <p class="text-xs text-surface-400 font-mono mt-0.5 truncate max-w-xs">
                #{{ movimiento()!.id }}
              </p>
            }
          </div>
          <button
            (click)="cerrar.emit()"
            class="text-surface-400 hover:text-surface-700 transition-colors cursor-pointer
                   rounded-lg p-1 hover:bg-surface-100"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Body scrolleable -->
        <div class="overflow-y-auto flex-1 p-6 space-y-6">

          @if (detalleQuery.isPending()) {
            <div class="flex justify-center py-12">
              <app-loading />
            </div>

          } @else if (detalleQuery.isError()) {
            <div class="text-center text-danger-600 py-8">
              <p>No se pudo cargar el movimiento.</p>
            </div>

          } @else if (movimiento(); as m) {

            <!-- ─── Warning de montos ───────────────────────────────────── -->
            @if (m.verificacion.aplica && !m.verificacion.coincide) {
              <div class="flex items-start gap-3 p-3.5 bg-warning-50 border border-warning-200 rounded-lg">

                <!-- Ícono warning -->
                <svg class="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>

                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-warning-800">Los montos no coinciden</p>
                  <p class="text-xs text-warning-700 mt-0.5">
                    Declarado (total − propina):
                    <span class="font-mono font-semibold">$ {{ m.verificacion.montoDeclarado }}</span>
                    &nbsp;·&nbsp;
                    Productos:
                    <span class="font-mono font-semibold">$ {{ m.verificacion.montoProductos }}</span>
                  </p>

                  <!-- Motivos (lista expandible al hacer hover con CSS) -->
                  @if (m.verificacion.motivos.length > 0) {
                    <div class="mt-2.5">
                      <!-- Trigger: botón que togglea los motivos -->
                      <button
                        type="button"
                        (click)="toggleMotivos()"
                        class="inline-flex items-center gap-1.5 text-xs font-medium text-warning-700
                               hover:text-warning-900 transition-colors cursor-pointer"
                      >
                        <svg class="w-3.5 h-3.5 transition-transform duration-200"
                             [class.rotate-180]="motivosVisibles()"
                             fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                        </svg>
                        {{ motivosVisibles() ? 'Ocultar' : 'Ver' }} posibles motivos
                      </button>

                      @if (motivosVisibles()) {
                        <ul class="mt-2 space-y-1.5 animate-[fadeIn_150ms_ease-out_both]">
                          @for (motivo of m.verificacion.motivos; track $index) {
                            <li class="flex items-start gap-2 text-xs text-warning-700 leading-snug">
                              <span class="mt-1 w-1.5 h-1.5 rounded-full bg-warning-400 flex-shrink-0"></span>
                              {{ motivo }}
                            </li>
                          }
                        </ul>
                      }
                    </div>
                  }
                </div>
              </div>
            }

            <!-- ─── Datos principales ───────────────────────────────────── -->
            <dl class="grid grid-cols-2 gap-x-6 gap-y-4">
              <div class="col-span-2">
                <dt class="text-xs font-semibold text-surface-500 uppercase tracking-wide">Descripción</dt>
                <dd class="mt-1 text-sm text-surface-900 font-medium">{{ m.descripcion }}</dd>
              </div>

              <div>
                <dt class="text-xs font-semibold text-surface-500 uppercase tracking-wide">Fecha</dt>
                <dd class="mt-1 text-sm text-surface-900">{{ m.fechaIngreso }}</dd>
              </div>

              <div>
                <dt class="text-xs font-semibold text-surface-500 uppercase tracking-wide">Medio de Pago</dt>
                <dd class="mt-1">
                  <app-badge variant="info">{{ m.medioPago }}</app-badge>
                </dd>
              </div>

              <div>
                <dt class="text-xs font-semibold text-surface-500 uppercase tracking-wide">Monto Total</dt>
                <dd class="mt-1 text-sm text-surface-900 font-bold">$ {{ m.montoTotal }}</dd>
              </div>

              <div>
                <dt class="text-xs font-semibold text-surface-500 uppercase tracking-wide">Propina</dt>
                <dd class="mt-1 text-sm text-surface-900">
                  {{ m.propina ? '$ ' + m.propina : '—' }}
                </dd>
              </div>

              @if (m.tipoMovimiento) {
                <div>
                  <dt class="text-xs font-semibold text-surface-500 uppercase tracking-wide">Tipo</dt>
                  <dd class="mt-1 text-sm text-surface-900">{{ m.tipoMovimiento }}</dd>
                </div>
              }

              @if (m.caja) {
                <div>
                  <dt class="text-xs font-semibold text-surface-500 uppercase tracking-wide">Caja</dt>
                  <dd class="mt-1 text-sm text-surface-900">{{ m.caja }}</dd>
                </div>
              }

              @if (m.usuario) {
                <div class="col-span-2">
                  <dt class="text-xs font-semibold text-surface-500 uppercase tracking-wide">Operador</dt>
                  <dd class="mt-1 text-sm text-surface-900">{{ m.usuario }}</dd>
                </div>
              }
            </dl>

            <!-- ─── ID Transacción ─────────────────────────────────────── -->
            <div class="rounded-lg bg-surface-50 border border-surface-200 p-3.5">
              <p class="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">
                ID Transacción
              </p>
              <div class="flex items-center gap-2">
                <code class="flex-1 text-xs font-mono text-surface-700 break-all leading-relaxed">
                  {{ m.idTransaccion }}
                </code>
                <button
                  type="button"
                  (click)="copiarId(m.idTransaccion)"
                  class="flex-shrink-0 p-1.5 rounded-md text-surface-400 transition-colors cursor-pointer
                         hover:text-surface-700 hover:bg-surface-200"
                  [title]="copiado() ? 'Copiado!' : 'Copiar ID'"
                  aria-label="Copiar ID de transacción"
                >
                  @if (copiado()) {
                    <svg class="w-4 h-4 text-success-500" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  } @else {
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  }
                </button>
              </div>
            </div>

            <!-- ─── Productos ──────────────────────────────────────────── -->
            @if ((m.productos?.length ?? 0) > 0) {
              <div>
                <p class="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">
                  Productos ({{ m.productos!.length }})
                </p>
                <div class="space-y-2">
                  @for (p of m.productos!; track p.id) {
                    <div class="flex items-center gap-3 bg-surface-50 border border-surface-200
                                rounded-lg px-3.5 py-2.5">
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-surface-900 truncate">
                          {{ p.nombre ?? '—' }}
                        </p>
                        <p class="text-xs text-surface-400">$ {{ p.montoUnitario }} c/u</p>
                      </div>
                      <div class="flex-shrink-0 text-right">
                        <span class="text-xs text-surface-500">Cant.</span>
                        <span class="ml-1 text-sm font-semibold text-surface-900">{{ p.cantidad }}</span>
                      </div>
                      <div class="flex-shrink-0 text-right min-w-[64px]">
                        <p class="text-sm font-bold text-surface-900">
                          $ {{ subtotal(p.montoUnitario, p.cantidad) }}
                        </p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

          }
        </div>

        <!-- Footer -->
        <div class="flex justify-end p-6 pt-4 border-t border-surface-200 flex-shrink-0">
          <app-button variant="outline" (onClick)="cerrar.emit()">Cerrar</app-button>
        </div>

      </div>
    </div>
  `,
})
export class MovementDetailComponent {
  private readonly movimientoService = inject(MovimientoService);

  movimientoId = input.required<number>();
  cerrar = output<void>();

  copiado = signal(false);
  motivosVisibles = signal(false);

  detalleQuery = injectQuery(() => ({
    queryKey: ['movimientos', this.movimientoId()],
    queryFn: () =>
      this.movimientoService
        .getById(this.movimientoId())
        .toPromise()
        .then((res) => res!.data),
  }));

  movimiento() {
    return this.detalleQuery.data() ?? null;
  }

  toggleMotivos(): void {
    this.motivosVisibles.update((v) => !v);
  }

  copiarId(id: string): void {
    navigator.clipboard.writeText(id).then(() => {
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2000);
    });
  }

  subtotal(precioUnitario: string, cantidad: number): string {
    const total = parseFloat(precioUnitario) * cantidad;
    return isNaN(total) ? '0' : total.toFixed(2).replace(/\.00$/, '');
  }
}
