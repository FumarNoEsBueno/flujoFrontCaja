import { Component, signal } from '@angular/core';

import type { UsuarioTabla } from '../../models';
import { PageHeaderComponent, ButtonComponent } from '../../../shared/components';
import { UsersListComponent } from '../users-list/users-list.component';
import { UserFormComponent } from '../user-form/user-form.component';
import { UserDeleteComponent } from '../user-delete/user-delete.component';
import { UserCajasComponent } from '../user-cajas/user-cajas.component';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    ButtonComponent,
    UsersListComponent,
    UserFormComponent,
    UserDeleteComponent,
    UserCajasComponent,
  ],
  template: `
    <app-page-header
      title="Usuarios"
      subtitle="Gestión de usuarios del sistema"
    >
      <app-button variant="primary" (onClick)="onNuevoUsuario()">
        + Nuevo Usuario
      </app-button>
    </app-page-header>

    <app-users-list
      (editar)="onEditar($event)"
      (eliminar)="onEliminar($event)"
      (gestionarCajas)="onGestionarCajas($event)"
    />

    @if (mostrandoFormulario()) {
      <app-user-form
        [usuario]="usuarioAEditar()"
        (cerrar)="cerrar()"
        (guardado)="onGuardado()"
      />
    }

    @if (usuarioAEliminar() !== null) {
      <app-user-delete
        [usuario]="usuarioAEliminar()!"
        (cerrar)="cerrar()"
        (eliminado)="onEliminado()"
      />
    }

    @if (usuarioParaCajas() !== null) {
      <app-user-cajas
        [usuario]="usuarioParaCajas()!"
        (cerrar)="cerrar()"
      />
    }
  `,
})
export class UsersPageComponent {
  // ─── Estado de modales ───────────────────────────────────────────────────

  mostrandoFormulario = signal(false);
  usuarioAEditar      = signal<UsuarioTabla | null>(null);
  usuarioAEliminar    = signal<UsuarioTabla | null>(null);
  usuarioParaCajas    = signal<UsuarioTabla | null>(null);

  // ─── Handlers: formulario ────────────────────────────────────────────────

  onNuevoUsuario(): void {
    this.usuarioAEditar.set(null);
    this.mostrandoFormulario.set(true);
  }

  onEditar(usuario: UsuarioTabla): void {
    this.usuarioAEditar.set(usuario);
    this.mostrandoFormulario.set(true);
  }

  onGuardado(): void {
    this.mostrandoFormulario.set(false);
    this.usuarioAEditar.set(null);
  }

  // ─── Handlers: eliminar ──────────────────────────────────────────────────

  onEliminar(usuario: UsuarioTabla): void {
    this.usuarioAEliminar.set(usuario);
  }

  onEliminado(): void {
    this.usuarioAEliminar.set(null);
  }

  // ─── Handlers: cajas ─────────────────────────────────────────────────────

  onGestionarCajas(usuario: UsuarioTabla): void {
    this.usuarioParaCajas.set(usuario);
  }

  // ─── Cerrar todos los modales ────────────────────────────────────────────

  cerrar(): void {
    this.mostrandoFormulario.set(false);
    this.usuarioAEditar.set(null);
    this.usuarioAEliminar.set(null);
    this.usuarioParaCajas.set(null);
  }
}
