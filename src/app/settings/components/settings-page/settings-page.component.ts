import { Component } from '@angular/core';
import { PageHeaderComponent, CardComponent } from '../../../shared/components';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [PageHeaderComponent, CardComponent],
  template: `
    <app-page-header
      title="Configuración"
      subtitle="Configuración general del sistema"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <app-card title="General" [divider]="true">
        <div class="flex items-center justify-center py-8 text-surface-400">
          <p class="text-sm">Configuraciones generales</p>
        </div>
      </app-card>

      <app-card title="Notificaciones" [divider]="true">
        <div class="flex items-center justify-center py-8 text-surface-400">
          <p class="text-sm">Preferencias de notificaciones</p>
        </div>
      </app-card>
    </div>
  `,
})
export class SettingsPageComponent {}
