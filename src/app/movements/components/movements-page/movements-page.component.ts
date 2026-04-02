import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import type { CajaAutocomplete, Movimiento } from '../../models';
import { PageHeaderComponent } from '../../../shared/components';
import { MovementsListComponent } from '../movements-list/movements-list.component';
import { MovementFormComponent } from '../movement-form/movement-form.component';
import { MovementDetailComponent } from '../movement-detail/movement-detail.component';
import { MovementDeleteComponent } from '../movement-delete/movement-delete.component';

@Component({
  selector: 'app-movements-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    MovementsListComponent,
    MovementFormComponent,
    MovementDetailComponent,
    MovementDeleteComponent,
  ],
  template: `
    <app-page-header
      title="Movimientos"
      subtitle="Registro de ingresos y egresos de caja"
    />

    <app-movements-list
      [cajaPreseleccionadaId]="cajaPreseleccionadaId()"
      [cajaPreseleccionadaNombre]="cajaPreseleccionadaNombre()"
      (nuevoMovimiento)="onNuevoMovimiento($event)"
      (verDetalle)="onVerDetalle($event)"
      (eliminar)="onEliminar($event)"
      (editar)="onEditarMovimiento($event)"
    />

    <!-- Modal: Nuevo Movimiento -->
    @if (mostrandoFormulario()) {
      <app-movement-form
        [cajasDisponibles]="cajasDisponibles()"
        [mode]="formMode()"
        [movimiento]="movimientoEditando()"
        [id]="movimientoEditandoId()"
        (cerrar)="cerrarFormulario()"
        (guardado)="onMovimientoGuardado()"
      />
    }

    <!-- Modal: Detalle -->
    @if (movimientoDetalle() !== null) {
      <app-movement-detail
        [movimientoId]="movimientoDetalle()!"
        (cerrar)="cerrarDetalle()"
      />
    }

    <!-- Modal: Eliminar -->
    @if (movimientoAEliminar() !== null) {
      <app-movement-delete
        [movimiento]="movimientoAEliminar()!"
        (cerrar)="cerrarEliminar()"
        (eliminado)="onMovimientoEliminado()"
      />
    }
  `,
})
export class MovementsPageComponent implements OnInit {
  private readonly router = inject(Router);

  mostrandoFormulario       = signal(false);
  cajasDisponibles          = signal<CajaAutocomplete[]>([]);
  movimientoDetalle         = signal<number | null>(null);
  movimientoAEliminar       = signal<Movimiento | null>(null);
  cajaPreseleccionadaId     = signal<number | null>(null);
  cajaPreseleccionadaNombre = signal<string | null>(null);
  formMode                  = signal<'create' | 'edit'>('create');
  movimientoEditando        = signal<Movimiento | null>(null);
  movimientoEditandoId      = signal<number | null>(null);

  ngOnInit(): void {
    const state = this.router.getCurrentNavigation()?.extras?.state
      ?? (history.state as Record<string, unknown>);

    if (state?.['cajaId']) {
      this.cajaPreseleccionadaId.set(Number(state['cajaId']));
      this.cajaPreseleccionadaNombre.set(String(state['cajaNombre'] ?? ''));
    }
  }

  // ─── Formulario ────────────────────────────────────────────────────────────

  onNuevoMovimiento(payload: { cajas: CajaAutocomplete[] }): void {
    this.formMode.set('create');
    this.movimientoEditando.set(null);
    this.movimientoEditandoId.set(null);
    this.cajasDisponibles.set(payload.cajas);
    this.mostrandoFormulario.set(true);
  }

  onEditarMovimiento(movimiento: Movimiento): void {
    this.formMode.set('edit');
    this.movimientoEditando.set(movimiento);
    this.movimientoEditandoId.set(movimiento.id);
    this.mostrandoFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrandoFormulario.set(false);
    this.formMode.set('create');
    this.movimientoEditando.set(null);
    this.movimientoEditandoId.set(null);
  }

  onMovimientoGuardado(): void {
    this.mostrandoFormulario.set(false);
  }

  // ─── Detalle ───────────────────────────────────────────────────────────────

  onVerDetalle(movimiento: Movimiento): void {
    this.movimientoDetalle.set(movimiento.id);
  }

  cerrarDetalle(): void {
    this.movimientoDetalle.set(null);
  }

  // ─── Eliminar ──────────────────────────────────────────────────────────────

  onEliminar(movimiento: Movimiento): void {
    this.movimientoAEliminar.set(movimiento);
  }

  cerrarEliminar(): void {
    this.movimientoAEliminar.set(null);
  }

  onMovimientoEliminado(): void {
    this.movimientoAEliminar.set(null);
  }
}
