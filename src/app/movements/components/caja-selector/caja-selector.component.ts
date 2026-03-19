import { Component, inject, output, signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';

import { CajaService } from '../../services/caja.service';
import type { Caja } from '../../models';
import { ButtonComponent, CardComponent, LoadingComponent } from '../../../shared/components';
import { IconCheckCircleComponent } from '../../../shared/icons';

@Component({
  selector: 'app-caja-selector',
  standalone: true,
  imports: [CardComponent, ButtonComponent, LoadingComponent, IconCheckCircleComponent],
  template: `
    <div class="flex flex-col items-center justify-center py-12">
      <div class="w-full max-w-lg">
        <div class="text-center mb-8">
          <span class="text-5xl mb-4 block">🏧</span>
          <h2 class="text-xl font-bold text-surface-900 mb-1">Seleccioná una caja</h2>
          <p class="text-sm text-surface-500">
            Para registrar movimientos, primero seleccioná la caja con la que vas a trabajar.
          </p>
        </div>

        @if (cajasQuery.isPending()) {
          <div class="flex justify-center">
            <app-loading />
          </div>
        } @else if (cajasQuery.isError()) {
          <app-card>
            <div class="text-center text-danger-600 py-4">
              <p class="font-medium">Error al cargar las cajas</p>
              <p class="text-sm text-surface-500 mt-1">Intentá recargar la página.</p>
            </div>
          </app-card>
        } @else if (cajas().length === 0) {
          <app-card>
            <div class="text-center py-6 text-surface-500">
              <p class="font-medium">No tenés cajas asignadas</p>
              <p class="text-sm mt-1">Contactá al administrador para que te asigne una caja.</p>
            </div>
          </app-card>
        } @else {
          <div class="grid gap-3">
            @for (caja of cajas(); track caja.id) {
              <button
                (click)="seleccionar(caja)"
                class="w-full text-left p-4 bg-white border-2 rounded-xl transition-all duration-200 cursor-pointer
                       hover:border-primary-500 hover:shadow-md active:scale-[0.99]
                       focus-visible:outline-2 focus-visible:outline-primary-500"
                [class.border-primary-500]="cajaSeleccionada()?.id === caja.id"
                [class.border-surface-200]="cajaSeleccionada()?.id !== caja.id"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span class="text-lg">🏧</span>
                  </div>
                  <div>
                    <p class="font-semibold text-surface-900">{{ caja.nombre }}</p>
                    @if (caja.local) {
                      <p class="text-sm text-surface-500">{{ caja.local.nombre }}</p>
                    }
                  </div>
                  @if (cajaSeleccionada()?.id === caja.id) {
                    <div class="ml-auto text-primary-600">
                      <app-icon-check-circle class="w-5 h-5" />
                    </div>
                  }
                </div>
              </button>
            }
          </div>

          @if (cajaSeleccionada()) {
            <div class="mt-6">
              <app-button
                variant="primary"
                [fullWidth]="true"
                size="lg"
                (onClick)="confirmar()"
              >
                Continuar con {{ cajaSeleccionada()!.nombre }}
              </app-button>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class CajaSelectorComponent {
  private readonly cajaService = inject(CajaService);

  cajaConfirmada = output<Caja>();

  cajaSeleccionada = signal<Caja | null>(null);

  cajasQuery = injectQuery(() => ({
    queryKey: ['cajas'],
    queryFn: () => this.cajaService.getAll().toPromise().then((res) => res!.data),
  }));

  cajas() {
    return this.cajasQuery.data() ?? [];
  }

  seleccionar(caja: Caja): void {
    this.cajaSeleccionada.set(caja);
  }

  confirmar(): void {
    const caja = this.cajaSeleccionada();
    if (caja) {
      this.cajaConfirmada.emit(caja);
    }
  }
}
