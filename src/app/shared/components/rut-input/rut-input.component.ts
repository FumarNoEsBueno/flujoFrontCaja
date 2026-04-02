import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgClass } from '@angular/common';

import { validRut, formatRut, normalizeRut } from 'chilean-rutify';

// ─── Counter for deterministic IDs ───────────────────────────────────────────

let _rutInputIdCounter = 0;

// ─── Component ─────────────────────────────────────────────────────────────

@Component({
  selector: 'app-rut-input',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="flex flex-col gap-1.5">
      @if (label()) {
        <label [for]="inputId()" class="text-sm font-medium text-surface-700">
          {{ label() }}
          @if (required()) {
            <span class="text-danger-500">*</span>
          }
        </label>
      }

      <div class="relative">
        <input
          [id]="inputId()"
          type="text"
          [placeholder]="placeholder()"
          [disabled]="isDisabled()"
          [value]="displayValue()"
          [ngClass]="{
            'border-danger-400 focus:ring-danger-500 focus:border-danger-500': errorMessage(),
            'border-surface-300 focus:ring-primary-500 focus:border-primary-500': !errorMessage(),
          }"
          (input)="onInput($event)"
          (blur)="onTouched()"
          class="w-full px-3.5 py-2.5 bg-white border rounded-lg text-surface-900
                 placeholder:text-surface-400 text-sm
                 focus:outline-none focus:ring-2 focus:ring-offset-0
                 disabled:bg-surface-100 disabled:cursor-not-allowed
                 transition-colors duration-150"
          maxlength="12"
          autocomplete="off"
        />
      </div>

      @if (errorMessage()) {
        <p class="text-xs text-danger-600">{{ errorMessage() }}</p>
      }
      @if (hint() && !errorMessage()) {
        <p class="text-xs text-surface-500">{{ hint() }}</p>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RutInputComponent),
      multi: true,
    },
  ],
})
export class RutInputComponent implements ControlValueAccessor {
  label      = input('');
  placeholder = input('Ej: 20194802-9');
  required   = input(false);
  hint       = input('');
  inputId    = input(`rut-input-${++_rutInputIdCounter}`);

  // ─── Internal state ───────────────────────────────────────────────────────

  displayValue = signal('');
  private rawValue = signal<string | null>(null);
  isDisabled   = signal(false);

  onTouched: () => void = () => {};

  // ─── Validation ───────────────────────────────────────────────────────────

  isValid = computed(() => {
    const raw = this.rawValue();
    if (!raw || raw.length < 2) return true; // empty is valid (use required for that)
    return validRut(raw);
  });

  errorMessage = computed(() => {
    const raw = this.rawValue();
    if (!raw || raw.length < 2) return '';
    if (!this.isValid()) return 'El RUT no es válido.';
    return '';
  });

  // ─── CVA ─────────────────────────────────────────────────────────────────

  /**
   * Called by the form infrastructure to set/replace the current value.
   * Used in edit mode to pre-fill the input with an existing RUT.
   */
  writeValue(value: string): void {
    if (value) {
      // normalizeRut strips formatting → "201948029", then formatRut adds it back → "20194802-9"
      const raw = normalizeRut(value) ?? value;
      const formatted = formatRut(raw) ?? raw;
      this.displayValue.set(formatted);
      this.rawValue.set(raw);
    } else {
      this.displayValue.set('');
      this.rawValue.set('');
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  // ─── Formatting on keystroke ─────────────────────────────────────────────

  private _onChange: (value: string) => void = () => {};

  onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;

    // Strip all non-alphanumeric to get just the RUT digits+dv
    const stripped = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // formatRut expects a string like "201948029" (digits+dv, no dots/dash)
    const formatted = formatRut(stripped) ?? stripped;

    this.displayValue.set(formatted);
    this.rawValue.set(stripped);
    this._onChange(stripped);
  }
}
