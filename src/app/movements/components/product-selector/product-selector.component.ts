import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  output,
  signal,
  ViewChild,
  DOCUMENT,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';

import { ProductoService } from '../../services/producto.service';
import type { ProductoAutocomplete, ProductoLineaItem } from '../../models';

@Component({
  selector: 'app-product-selector',
  standalone: true,
  template: `
    <div class="space-y-2">
      <label class="block text-xs font-semibold text-surface-600 uppercase tracking-wide">
        Productos <span class="text-surface-400 font-normal normal-case">(opcional)</span>
      </label>

      <!-- Buscador -->
      <div class="relative">
        <input
          #inputEl
          type="text"
          [value]="query()"
          placeholder="Buscá un producto..."
          (input)="onInput($event)"
          (focus)="onFocus()"
          class="w-full px-3.5 py-2.5 bg-white border rounded-lg text-surface-900
                 placeholder:text-surface-400 text-sm focus:outline-none focus:ring-2
                 focus:ring-primary-500 focus:border-primary-500 transition-colors pr-9"
          [class.border-surface-300]="!open()"
          [class.border-primary-500]="open()"
          [class.ring-2]="open()"
          [class.ring-primary-500]="open()"
          autocomplete="off"
        />
        <!-- Icono lupa -->
        <div class="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
          </svg>
        </div>
      </div>

      <!-- Loading state -->
      @if (productosQuery.isPending()) {
        <p class="text-xs text-surface-400 px-0.5">Cargando productos...</p>
      }

      <!-- Lista de productos seleccionados -->
      @if (lineas().length > 0) {
        <div class="space-y-2 mt-1">
          @for (linea of lineas(); track linea.prod_id) {
            <div class="flex items-center gap-3 bg-surface-50 border border-surface-200
                        rounded-lg px-3 py-2">
              <!-- Nombre + precio unitario -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-surface-900 truncate">{{ linea.label }}</p>
                <p class="text-xs text-surface-400">\${{ linea.precio }} c/u</p>
              </div>

              <!-- Controles de cantidad -->
              <div class="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  (click)="decrementar(linea.prod_id)"
                  class="w-7 h-7 rounded-full border border-surface-300 text-surface-600
                         hover:bg-surface-100 transition-colors flex items-center justify-center
                         cursor-pointer"
                  aria-label="Decrementar cantidad"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4"/>
                  </svg>
                </button>

                <span class="w-6 text-center text-sm font-semibold text-surface-900 select-none">
                  {{ linea.cantidad }}
                </span>

                <button
                  type="button"
                  (click)="incrementar(linea.prod_id)"
                  class="w-7 h-7 rounded-full border border-surface-300 text-surface-600
                         hover:bg-surface-100 transition-colors flex items-center justify-center
                         cursor-pointer"
                  aria-label="Incrementar cantidad"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
                  </svg>
                </button>
              </div>

              <!-- Eliminar -->
              <button
                type="button"
                (click)="eliminar(linea.prod_id)"
                class="text-surface-300 hover:text-danger-500 transition-colors cursor-pointer
                       flex-shrink-0 rounded p-0.5"
                aria-label="Eliminar producto"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ProductSelectorComponent implements AfterViewInit, OnDestroy {
  private readonly productoService = inject(ProductoService);
  private readonly elRef           = inject(ElementRef);
  private readonly document        = inject(DOCUMENT);

  @ViewChild('inputEl') inputEl!: ElementRef<HTMLInputElement>;

  // ─── Output ───────────────────────────────────────────────────────────────

  productosChange = output<ProductoLineaItem[]>();

  // ─── Estado ───────────────────────────────────────────────────────────────

  query = signal('');
  open  = signal(false);
  lineas = signal<ProductoLineaItem[]>([]);

  // ─── Portal DOM node ──────────────────────────────────────────────────────

  private dropdownEl: HTMLDivElement | null = null;

  // ─── Query ────────────────────────────────────────────────────────────────

  productosQuery = injectQuery(() => ({
    queryKey: ['productos', 'autocomplete'],
    queryFn:  () => lastValueFrom(this.productoService.autocomplete()),
    staleTime: 5 * 60 * 1000,
  }));

  filteredOptions = computed<ProductoAutocomplete[]>(() => {
    const todos       = this.productosQuery.data()?.data ?? [];
    const yaAgregados = new Set(this.lineas().map((l) => l.prod_id));
    const q           = this.query().toLowerCase().trim();

    return todos
      .filter((p) => !yaAgregados.has(p.id))
      .filter((p) => !q || p.label.toLowerCase().includes(q));
  });

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  ngAfterViewInit(): void {
    // Crear el nodo del portal y adjuntarlo al body
    this.dropdownEl = this.document.createElement('div');
    this.dropdownEl.style.position = 'fixed';
    this.dropdownEl.style.zIndex   = '9999';
    this.dropdownEl.style.display  = 'none';
    this.document.body.appendChild(this.dropdownEl);
  }

  ngOnDestroy(): void {
    this.dropdownEl?.remove();
  }

  // ─── Handlers ─────────────────────────────────────────────────────────────

  onFocus(): void {
    this.open.set(true);
    this.renderDropdown();
  }

  onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.open.set(true);
    this.renderDropdown();
  }

  agregarProducto(id: number): void {
    const p = this.filteredOptions().find((o) => o.id === id);
    if (!p) return;
    this.lineas.update((prev) => [
      ...prev,
      { prod_id: p.id, label: p.label, precio: p.precio, cantidad: 1 },
    ]);
    this.query.set('');
    this.cerrarDropdown();
    this.emitir();
  }

  incrementar(prodId: number): void {
    this.lineas.update((prev) =>
      prev.map((l) => (l.prod_id === prodId ? { ...l, cantidad: l.cantidad + 1 } : l)),
    );
    this.emitir();
  }

  decrementar(prodId: number): void {
    this.lineas.update((prev) =>
      prev.map((l) =>
        l.prod_id === prodId ? { ...l, cantidad: Math.max(1, l.cantidad - 1) } : l,
      ),
    );
    this.emitir();
  }

  eliminar(prodId: number): void {
    this.lineas.update((prev) => prev.filter((l) => l.prod_id !== prodId));
    this.emitir();
  }

  private emitir(): void {
    this.productosChange.emit(this.lineas());
  }

  // ─── Portal: renderizado del dropdown en el body ──────────────────────────

  private renderDropdown(): void {
    if (!this.dropdownEl || !this.inputEl) return;

    const options  = this.filteredOptions();
    const isPending = this.productosQuery.isPending();
    const q        = this.query();

    const showList    = options.length > 0;
    const showEmpty   = q.length > 0 && options.length === 0 && !isPending;

    if (!showList && !showEmpty) {
      this.dropdownEl.style.display = 'none';
      return;
    }

    // Posicionar respecto al input
    const rect = this.inputEl.nativeElement.getBoundingClientRect();
    this.dropdownEl.style.top    = `${rect.bottom + 4}px`;
    this.dropdownEl.style.left   = `${rect.left}px`;
    this.dropdownEl.style.width  = `${rect.width}px`;
    this.dropdownEl.style.display = 'block';

    // Construir HTML del dropdown
    if (showList) {
      const items = options.map((p) =>
        `<button
          data-prod-id="${p.id}"
          type="button"
          style="width:100%;text-align:left;padding:10px 14px;font-size:14px;
                 display:flex;justify-content:space-between;align-items:center;
                 cursor:pointer;color:#374151;background:transparent;border:none;
                 transition:background 150ms"
          onmouseover="this.style.background='#f8fafc'"
          onmouseout="this.style.background='transparent'"
        >
          <span>${p.label}</span>
          <span style="color:#9ca3af;font-size:12px">$${p.precio}</span>
        </button>`
      ).join('');

      this.dropdownEl.innerHTML = `
        <div style="background:white;border:1px solid #e2e8f0;border-radius:8px;
                    box-shadow:0 4px 16px rgba(0,0,0,0.12);overflow:hidden">
          <div style="max-height:192px;overflow-y:auto">${items}</div>
        </div>
      `;
    } else {
      this.dropdownEl.innerHTML = `
        <div style="background:white;border:1px solid #e2e8f0;border-radius:8px;
                    box-shadow:0 4px 16px rgba(0,0,0,0.12);
                    padding:12px 14px;font-size:14px;color:#9ca3af;text-align:center">
          Sin resultados
        </div>
      `;
    }

    // Adjuntar listeners a los botones generados
    this.dropdownEl.querySelectorAll<HTMLButtonElement>('button[data-prod-id]').forEach((btn) => {
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault(); // evitar que el input pierda el foco antes del click
        const id = Number(btn.dataset['prodId']);
        this.agregarProducto(id);
      });
    });
  }

  private cerrarDropdown(): void {
    this.open.set(false);
    if (this.dropdownEl) {
      this.dropdownEl.style.display = 'none';
      this.dropdownEl.innerHTML = '';
    }
  }

  // ─── Click outside ────────────────────────────────────────────────────────

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickDentroDelComponente = this.elRef.nativeElement.contains(target);
    const clickDentroDelDropdown   = this.dropdownEl?.contains(target) ?? false;

    if (!clickDentroDelComponente && !clickDentroDelDropdown) {
      this.cerrarDropdown();
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.open()) {
      this.renderDropdown(); // reposicionar si el usuario scrollea dentro del modal
    }
  }
}
