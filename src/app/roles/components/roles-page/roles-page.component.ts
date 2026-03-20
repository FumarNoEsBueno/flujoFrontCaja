import { Component, signal, computed } from '@angular/core';

import type { RolTabla } from '../../models';
import { PageHeaderComponent, ButtonComponent } from '../../../shared/components';
import { RolesListComponent } from '../roles-list/roles-list.component';
import { RoleFormComponent } from '../role-form/role-form.component';
import { RoleDeleteComponent } from '../role-delete/role-delete.component';

@Component({
  selector: 'app-roles-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    ButtonComponent,
    RolesListComponent,
    RoleFormComponent,
    RoleDeleteComponent,
  ],
  template: `
    <app-page-header
      title="Roles"
      subtitle="Gestión de roles y permisos del sistema"
    >
      <app-button variant="primary" (onClick)="onNuevoRol()">
        + Nuevo Rol
      </app-button>
    </app-page-header>

    <app-roles-list
      (editar)="onEditar($event)"
      (eliminar)="onEliminar($event)"
    />

    @if (mostrandoFormulario()) {
      @if (formKey(); as key) {
        <app-role-form
          [rol]="rolAEditar()"
          (cerrar)="cerrar()"
          (guardado)="onGuardado()"
        />
      }
    }

    @if (rolAEliminar() !== null) {
      <app-role-delete
        [rol]="rolAEliminar()!"
        (cerrar)="cerrar()"
        (eliminado)="onEliminado()"
      />
    }
  `,
})
export class RolesPageComponent {

  // ─── Estado de modales ───────────────────────────────────────────────────

  mostrandoFormulario = signal(false);
  rolAEditar          = signal<RolTabla | null>(null);
  rolAEliminar        = signal<RolTabla | null>(null);

  /**
   * Clave que cambia cada vez que se abre el formulario.
   * El @if anidado en el template la usa para destruir y recrear
   * app-role-form cada vez, garantizando que el constructor corra limpio.
   */
  private _formKey = signal(0);
  formKey = computed(() => this.mostrandoFormulario() ? this._formKey() : null);

  // ─── Handlers: formulario ────────────────────────────────────────────────

  onNuevoRol(): void {
    this.rolAEditar.set(null);
    this._formKey.update((k) => k + 1);
    this.mostrandoFormulario.set(true);
  }

  onEditar(rol: RolTabla): void {
    this.rolAEditar.set(rol);
    this._formKey.update((k) => k + 1);
    this.mostrandoFormulario.set(true);
  }

  onGuardado(): void {
    this.mostrandoFormulario.set(false);
    this.rolAEditar.set(null);
  }

  // ─── Handlers: eliminar ──────────────────────────────────────────────────

  onEliminar(rol: RolTabla): void {
    this.rolAEliminar.set(rol);
  }

  onEliminado(): void {
    this.rolAEliminar.set(null);
  }

  // ─── Cerrar todos los modales ────────────────────────────────────────────

  cerrar(): void {
    this.mostrandoFormulario.set(false);
    this.rolAEditar.set(null);
    this.rolAEliminar.set(null);
  }
}
