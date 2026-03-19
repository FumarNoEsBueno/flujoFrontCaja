import { Component, input, forwardRef, signal } from '@angular/core';
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
          [type]="type()"
          [placeholder]="placeholder()"
          [disabled]="isDisabled()"
          [value]="value()"
          [ngClass]="{
            'border-danger-400 focus:ring-danger-500 focus:border-danger-500': error(),
            'border-surface-300 focus:ring-primary-500 focus:border-primary-500': !error(),
          }"
          (input)="onInputChange($event)"
          (blur)="onTouched()"
          class="w-full px-3.5 py-2.5 bg-white border rounded-lg text-surface-900
                 placeholder:text-surface-400 text-sm
                 focus:outline-none focus:ring-2 focus:ring-offset-0
                 disabled:bg-surface-100 disabled:cursor-not-allowed
                 transition-colors duration-150"
        />
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
}
