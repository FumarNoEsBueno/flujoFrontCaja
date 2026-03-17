import { Component } from '@angular/core';
import { PageHeaderComponent, CardComponent, ButtonComponent } from '../../../shared/components';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [PageHeaderComponent, CardComponent, ButtonComponent],
  template: `
    <app-page-header
      title="Usuarios"
      subtitle="Gestión de usuarios del sistema"
    >
      <app-button variant="primary">
        + Nuevo Usuario
      </app-button>
    </app-page-header>

    <app-card>
      <div class="flex items-center justify-center py-16 text-surface-400">
        <div class="text-center">
          <span class="text-5xl mb-4 block">👥</span>
          <p class="text-lg font-medium text-surface-600 mb-1">Sin usuarios</p>
          <p class="text-sm">Los usuarios del sistema aparecerán aquí</p>
        </div>
      </div>
    </app-card>
  `,
})
export class UsersPageComponent {}
