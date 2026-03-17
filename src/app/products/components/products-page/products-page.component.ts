import { Component } from '@angular/core';
import { PageHeaderComponent, CardComponent, ButtonComponent } from '../../../shared/components';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [PageHeaderComponent, CardComponent, ButtonComponent],
  template: `
    <app-page-header
      title="Productos"
      subtitle="Administra el catálogo de productos"
    >
      <app-button variant="primary">
        + Nuevo Producto
      </app-button>
    </app-page-header>

    <app-card>
      <div class="flex items-center justify-center py-16 text-surface-400">
        <div class="text-center">
          <span class="text-5xl mb-4 block">📦</span>
          <p class="text-lg font-medium text-surface-600 mb-1">Sin productos</p>
          <p class="text-sm">El catálogo de productos aparecerá aquí</p>
        </div>
      </div>
    </app-card>
  `,
})
export class ProductsPageComponent {}
