import { Component, input, forwardRef, signal, computed } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

// Counter estático para IDs únicos y deterministas (sin Math.random())
let _inputIdCounter = 0;

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
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
          [type]="effectiveType()"
          [placeholder]="placeholder()"
          [disabled]="isDisabled()"
          [value]="value()"
          [ngClass]="{
            'border-danger-400 focus:ring-danger-500 focus:border-danger-500': error(),
            'border-surface-300 focus:ring-primary-500 focus:border-primary-500': !error(),
            'pr-10': type() === 'password',
          }"
          (input)="onInputChange($event)"
          (blur)="onTouched()"
          class="w-full px-3.5 py-2.5 bg-white border rounded-lg text-surface-900
                 placeholder:text-surface-400 text-sm
                 focus:outline-none focus:ring-2 focus:ring-offset-0
                 disabled:bg-surface-100 disabled:cursor-not-allowed
                 transition-colors duration-150"
        />

        @if (type() === 'password') {
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400
                   hover:text-surface-600 transition-colors duration-150 cursor-pointer"
            (click)="togglePasswordVisibility()"
            [title]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            tabindex="-1"
          >
            @if (showPassword()) {
              <!-- Ojo tachado: ocultar -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" stroke-width="1.5" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5
                     12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0
                     0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0
                     01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894
                     7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242
                     4.242L9.88 9.88" />
              </svg>
            } @else {
              <!-- Ojo abierto: mostrar -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" stroke-width="1.5" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12
                     4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577
                     16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          </button>
        }
      </div>
      @if (error()) {
        <p class="text-xs text-danger-600">{{ error() }}</p>
      }
      @if (hint() && !error()) {
        <p class="text-xs text-surface-500">{{ hint() }}</p>
      }
    </div>
  `,
})
export class InputComponent implements ControlValueAccessor {
  label = input('');
  type = input<'text' | 'email' | 'password' | 'number' | 'tel' | 'date'>('text');
  placeholder = input('');
  required = input(false);
  error = input('');
  hint = input('');
  inputId = input(`input-${++_inputIdCounter}`);

  value = signal('');
  isDisabled = signal(false);
  showPassword = signal(false);

  // ─── Tipo efectivo del <input> (alterna text/password con el toggle) ──────
  effectiveType = computed(() => {
    if (this.type() === 'password') {
      return this.showPassword() ? 'text' : 'password';
    }
    return this.type();
  });

  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }
}
