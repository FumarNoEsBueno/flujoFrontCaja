import { Component, signal } from '@angular/core';

import type { ProductoTabla } from '../../models';
import { PageHeaderComponent, ButtonComponent } from '../../../shared/components';
import { ProductsListComponent } from '../products-list/products-list.component';
import { ProductFormComponent } from '../product-form/product-form.component';
import { ProductDeleteComponent } from '../product-delete/product-delete.component';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    ButtonComponent,
    ProductsListComponent,
    ProductFormComponent,
    ProductDeleteComponent,
  ],
  template: `
    <app-page-header
      title="Productos"
      subtitle="Administración del catálogo de productos"
    >
      <app-button variant="primary" (onClick)="onNuevoProducto()">
        + Nuevo Producto
      </app-button>
    </app-page-header>

    <app-products-list
      (editar)="onEditar($event)"
      (eliminar)="onEliminar($event)"
    />

    @if (mostrandoFormulario()) {
      <app-product-form
        [producto]="productoAEditar()"
        (cerrar)="cerrar()"
        (guardado)="onGuardado()"
      />
    }

    @if (productoAEliminar() !== null) {
      <app-product-delete
        [producto]="productoAEliminar()!"
        (cerrar)="cerrar()"
        (eliminado)="onEliminado()"
      />
    }
  `,
})
export class ProductsPageComponent {

  // ─── Estado de modales ───────────────────────────────────────────────────

  mostrandoFormulario = signal(false);
  productoAEditar     = signal<ProductoTabla | null>(null);
  productoAEliminar   = signal<ProductoTabla | null>(null);

  // ─── Handlers: formulario ────────────────────────────────────────────────

  onNuevoProducto(): void {
    this.productoAEditar.set(null);
    this.mostrandoFormulario.set(true);
  }

  onEditar(producto: ProductoTabla): void {
    this.productoAEditar.set(producto);
    this.mostrandoFormulario.set(true);
  }

  onGuardado(): void {
    this.mostrandoFormulario.set(false);
    this.productoAEditar.set(null);
  }

  // ─── Handlers: eliminar ──────────────────────────────────────────────────

  onEliminar(producto: ProductoTabla): void {
    this.productoAEliminar.set(producto);
  }

  onEliminado(): void {
    this.productoAEliminar.set(null);
  }

  // ─── Cerrar todos los modales ────────────────────────────────────────────

  cerrar(): void {
    this.mostrandoFormulario.set(false);
    this.productoAEditar.set(null);
    this.productoAEliminar.set(null);
  }
}
