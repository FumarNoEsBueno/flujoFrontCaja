import {
  Component,
  computed,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgClass } from '@angular/common';
import { IconCloseComponent, IconChevronDownComponent } from '../../icons';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AutocompleteOption {
  id: number | string;
  label: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-custom-autocomplete',
  standalone: true,
  imports: [NgClass, IconCloseComponent, IconChevronDownComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomAutocompleteComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative w-full" role="combobox" [attr.aria-expanded]="open()">
      <!-- Label -->
      @if (label()) {
        <label class="block text-xs font-semibold text-surface-600 uppercase tracking-wide mb-1">
          {{ label() }}
          @if (required()) {
            <span class="text-danger-500 ml-0.5">*</span>
          }
        </label>
      }

      <!-- Input -->
      <div class="relative">
        <input
          #inputEl
          type="text"
          [value]="query()"
          [placeholder]="placeholder()"
          [disabled]="isDisabled()"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (keydown)="onKeydown($event)"
          class="w-full px-3.5 py-2.5 bg-white border rounded-lg text-surface-900
                 placeholder:text-surface-400 text-sm focus:outline-none focus:ring-2
                 focus:ring-primary-500 focus:border-primary-500 transition-colors pr-9"
          [ngClass]="{
            'border-surface-300': !open(),
            'border-primary-500 ring-2 ring-primary-500': open(),
            'opacity-50 cursor-not-allowed': isDisabled()
          }"
          role="searchbox"
          autocomplete="off"
          aria-autocomplete="list"
          [attr.aria-activedescendant]="activeDescendant()"
        />

        <!-- Chevron / Clear icon -->
        <div class="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          @if (selected() && !isDisabled()) {
            <button
              type="button"
              (click)="clearSelection()"
              class="text-surface-400 hover:text-surface-700 transition-colors cursor-pointer rounded"
              aria-label="Limpiar selección"
            >
              <app-icon-close class="w-3.5 h-3.5" [strokeWidth]="2.5" />
            </button>
          }
          <app-icon-chevron-down
            class="w-4 h-4 text-surface-400 transition-transform duration-200"
            [class.rotate-180]="open()"
          />
        </div>
      </div>

      <!-- Dropdown -->
      <div
        class="absolute z-50 w-full mt-1 bg-white border border-surface-200 rounded-lg shadow-dropdown
               overflow-hidden transition-all duration-200 origin-top"
        [ngClass]="{
          'opacity-100 scale-y-100 pointer-events-auto': open(),
          'opacity-0 scale-y-95 pointer-events-none': !open()
        }"
        role="listbox"
        [attr.aria-label]="label() || 'Opciones'"
      >
        <div class="max-h-52 overflow-y-auto">
          @if (filteredOptions().length === 0) {
            <div class="px-3.5 py-3 text-sm text-surface-400 text-center">
              Sin resultados
            </div>
          } @else {
            @for (option of filteredOptions(); track option.id; let i = $index) {
              <button
                type="button"
                [id]="'option-' + option.id"
                (click)="selectOption(option)"
                (mouseenter)="activeIndex.set(i)"
                class="w-full text-left px-3.5 py-2.5 text-sm transition-colors cursor-pointer"
                [ngClass]="{
                  'bg-primary-50 text-primary-700 font-medium': selected()?.id === option.id,
                  'bg-surface-100 text-surface-900': activeIndex() === i && selected()?.id !== option.id,
                  'text-surface-700 hover:bg-surface-50': activeIndex() !== i && selected()?.id !== option.id
                }"
                role="option"
                [attr.aria-selected]="selected()?.id === option.id"
              >
                {{ option.label }}
              </button>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class CustomAutocompleteComponent implements ControlValueAccessor {
  private readonly elRef = inject(ElementRef);

  // ─── Inputs ──────────────────────────────────────────────────────────────

  options     = input<AutocompleteOption[]>([]);
  label       = input<string>('');
  placeholder = input<string>('Buscar...');
  required    = input<boolean>(false);

  // ─── Internal state ──────────────────────────────────────────────────────

  query       = signal('');
  open        = signal(false);
  activeIndex = signal(-1);
  selected    = signal<AutocompleteOption | null>(null);
  isDisabled  = signal(false);

  filteredOptions = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.options();
    return this.options().filter((o) => o.label.toLowerCase().includes(q));
  });

  activeDescendant = computed(() => {
    const idx = this.activeIndex();
    const opts = this.filteredOptions();
    return idx >= 0 && idx < opts.length ? `option-${opts[idx].id}` : null;
  });

  // ─── CVA ─────────────────────────────────────────────────────────────────

  private onChange: (value: AutocompleteOption | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: AutocompleteOption | null): void {
    this.selected.set(value ?? null);
    this.query.set(value?.label ?? '');
  }

  registerOnChange(fn: (value: AutocompleteOption | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  // ─── Handlers ────────────────────────────────────────────────────────────

  onFocus(): void {
    if (!this.isDisabled()) {
      this.open.set(true);
      this.activeIndex.set(-1);
    }
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.open.set(true);
    this.activeIndex.set(-1);
    // Si el usuario borra el texto, limpiamos la selección
    if (!value.trim()) {
      this.selected.set(null);
      this.onChange(null);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    const opts = this.filteredOptions();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.open()) { this.open.set(true); return; }
        this.activeIndex.update((i) => Math.min(i + 1, opts.length - 1));
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update((i) => Math.max(i - 1, 0));
        break;

      case 'Enter':
        event.preventDefault();
        if (this.open() && this.activeIndex() >= 0 && opts[this.activeIndex()]) {
          this.selectOption(opts[this.activeIndex()]);
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.open.set(false);
        this.onTouched();
        break;

      case 'Tab':
        this.open.set(false);
        this.onTouched();
        break;
    }
  }

  selectOption(option: AutocompleteOption): void {
    this.selected.set(option);
    this.query.set(option.label);
    this.open.set(false);
    this.activeIndex.set(-1);
    this.onChange(option);
    this.onTouched();
  }

  clearSelection(): void {
    this.selected.set(null);
    this.query.set('');
    this.open.set(false);
    this.onChange(null);
    this.onTouched();
  }

  // ─── Click outside ───────────────────────────────────────────────────────

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!this.elRef.nativeElement.contains(target)) {
      if (this.open()) {
        this.open.set(false);
        this.onTouched();
        // Si había una selección previa, restaurar el label
        if (this.selected()) {
          this.query.set(this.selected()!.label);
        } else {
          this.query.set('');
        }
      }
    }
  }
}
