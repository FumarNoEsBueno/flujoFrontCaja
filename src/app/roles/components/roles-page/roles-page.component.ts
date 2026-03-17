import { Component } from '@angular/core';
import { PageHeaderComponent, CardComponent, ButtonComponent } from '../../../shared/components';

@Component({
  selector: 'app-roles-page',
  standalone: true,
  imports: [PageHeaderComponent, CardComponent, ButtonComponent],
  template: `
    <app-page-header
      title="Roles"
      subtitle="Gestión de roles y permisos"
    >
      <app-button variant="primary">
        + Nuevo Rol
      </app-button>
    </app-page-header>

    <app-card>
      <div class="flex items-center justify-center py-16 text-surface-400">
        <div class="text-center">
          <span class="text-5xl mb-4 block">🔑</span>
          <p class="text-lg font-medium text-surface-600 mb-1">Sin roles</p>
          <p class="text-sm">Los roles del sistema aparecerán aquí</p>
        </div>
      </div>
    </app-card>
  `,
})
export class RolesPageComponent {}
