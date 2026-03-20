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
import type { AutocompleteOption } from '../autocomplete/custom-autocomplete.component';

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-multi-autocomplete',
  standalone: true,
  imports: [NgClass, IconCloseComponent, IconChevronDownComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiAutocompleteComponent),
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
          type="text"
          [value]="query()"
          [placeholder]="selected().length === 0 ? placeholder() : ''"
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

        <!-- Chevron -->
        <div class="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          @if (selected().length > 0 && !isDisabled()) {
            <span class="text-xs font-semibold text-primary-600 bg-primary-50 rounded px-1.5 py-0.5">
              {{ selected().length }}
            </span>
          }
          <app-icon-chevron-down
            class="w-4 h-4 text-surface-400 transition-transform duration-200"
            [class.rotate-180]="open()"
          />
        </div>
      </div>

      <!-- Chips de seleccionados -->
      @if (selected().length > 0) {
        <div class="flex flex-wrap gap-1.5 mt-2">
          @for (item of selected(); track item.id) {
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 border border-primary-200
                     rounded-full text-xs font-medium text-primary-700"
            >
              {{ item.label }}
              @if (!isDisabled()) {
                <button
                  type="button"
                  (click)="removeItem(item)"
                  class="text-primary-400 hover:text-primary-700 transition-colors cursor-pointer rounded-full"
                  [attr.aria-label]="'Quitar ' + item.label"
                >
                  <app-icon-close class="w-3 h-3" [strokeWidth]="2.5" />
                </button>
              }
            </span>
          }

          @if (!isDisabled()) {
            <button
              type="button"
              (click)="clearAll()"
              class="text-xs text-surface-400 hover:text-danger-600 transition-colors cursor-pointer font-medium"
            >
              Limpiar todo
            </button>
          }
        </div>
      }

      <!-- Dropdown -->
      <div
        class="absolute z-50 w-full mt-1 bg-white border border-surface-200 rounded-lg shadow-dropdown
               overflow-hidden transition-all duration-200 origin-top"
        [ngClass]="{
          'opacity-100 scale-y-100 pointer-events-auto': open(),
          'opacity-0 scale-y-95 pointer-events-none': !open()
        }"
        role="listbox"
        [attr.aria-multiselectable]="true"
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
                [id]="'multi-option-' + option.id"
                (click)="toggleOption(option)"
                (mouseenter)="activeIndex.set(i)"
                class="w-full text-left px-3.5 py-2.5 text-sm transition-colors cursor-pointer
                       flex items-center gap-2.5"
                [ngClass]="{
                  'bg-primary-50 text-primary-700 font-medium': isSelected(option),
                  'bg-surface-100 text-surface-900': activeIndex() === i && !isSelected(option),
                  'text-surface-700 hover:bg-surface-50': activeIndex() !== i && !isSelected(option)
                }"
                role="option"
                [attr.aria-selected]="isSelected(option)"
              >
                <!-- Checkmark -->
                <span
                  class="w-4 h-4 flex-shrink-0 rounded border flex items-center justify-center transition-colors"
                  [ngClass]="{
                    'bg-primary-600 border-primary-600': isSelected(option),
                    'border-surface-300': !isSelected(option)
                  }"
                >
                  @if (isSelected(option)) {
                    <svg class="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  }
                </span>
                {{ option.label }}
              </button>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class MultiAutocompleteComponent implements ControlValueAccessor {
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
  selected    = signal<AutocompleteOption[]>([]);
  isDisabled  = signal(false);

  filteredOptions = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.options();
    return this.options().filter((o) => o.label.toLowerCase().includes(q));
  });

  activeDescendant = computed(() => {
    const idx = this.activeIndex();
    const opts = this.filteredOptions();
    return idx >= 0 && idx < opts.length ? `multi-option-${opts[idx].id}` : null;
  });

  isSelected(option: AutocompleteOption): boolean {
    return this.selected().some((s) => s.id === option.id);
  }

  // ─── CVA ─────────────────────────────────────────────────────────────────

  private onChange: (value: AutocompleteOption[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: AutocompleteOption[] | null): void {
    this.selected.set(value ?? []);
  }

  registerOnChange(fn: (value: AutocompleteOption[]) => void): void {
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
          this.toggleOption(opts[this.activeIndex()]);
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.open.set(false);
        this.query.set('');
        this.onTouched();
        break;

      case 'Tab':
        this.open.set(false);
        this.query.set('');
        this.onTouched();
        break;
    }
  }

  toggleOption(option: AutocompleteOption): void {
    const current = this.selected();
    const exists  = current.some((s) => s.id === option.id);
    const updated = exists
      ? current.filter((s) => s.id !== option.id)
      : [...current, option];

    this.selected.set(updated);
    this.onChange(updated);
    this.onTouched();
    // Mantener el dropdown abierto para selección múltiple
    this.query.set('');
  }

  removeItem(option: AutocompleteOption): void {
    const updated = this.selected().filter((s) => s.id !== option.id);
    this.selected.set(updated);
    this.onChange(updated);
    this.onTouched();
  }

  clearAll(): void {
    this.selected.set([]);
    this.onChange([]);
    this.onTouched();
  }

  // ─── Click outside ───────────────────────────────────────────────────────

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!this.elRef.nativeElement.contains(target)) {
      if (this.open()) {
        this.open.set(false);
        this.query.set('');
        this.onTouched();
      }
    }
  }
}
