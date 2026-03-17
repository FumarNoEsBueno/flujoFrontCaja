import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [ngClass]="buttonClasses()"
      (click)="onClick.emit($event)"
      class="inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer
             focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500
             disabled:opacity-50 disabled:cursor-not-allowed"
    >
      @if (loading()) {
        <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      }
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input(false);
  loading = input(false);
  fullWidth = input(false);
  onClick = output<MouseEvent>();

  buttonClasses() {
    const base = this.fullWidth() ? 'w-full' : '';

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-lg',
      lg: 'px-6 py-3 text-base rounded-lg',
    };

    const variants: Record<ButtonVariant, string> = {
      primary:
        'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm',
      secondary:
        'bg-surface-200 text-surface-800 hover:bg-surface-300 active:bg-surface-400',
      outline:
        'border border-surface-300 text-surface-700 hover:bg-surface-100 active:bg-surface-200',
      ghost:
        'text-surface-600 hover:bg-surface-100 hover:text-surface-900 active:bg-surface-200',
      danger:
        'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800 shadow-sm',
    };

    return `${base} ${sizes[this.size()]} ${variants[this.variant()]}`;
  }
}
