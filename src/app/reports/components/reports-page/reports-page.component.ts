import { Component } from '@angular/core';
import { PageHeaderComponent, CardComponent } from '../../../shared/components';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [PageHeaderComponent, CardComponent],
  template: `
    <app-page-header
      title="Reportes"
      subtitle="Genera y consulta reportes del sistema"
    />

    <app-card>
      <div class="flex items-center justify-center py-16 text-surface-400">
        <div class="text-center">
          <span class="text-5xl mb-4 block">📋</span>
          <p class="text-lg font-medium text-surface-600 mb-1">Reportes</p>
          <p class="text-sm">Las opciones de reportes aparecerán aquí</p>
        </div>
      </div>
    </app-card>
  `,
})
export class ReportsPageComponent {}
