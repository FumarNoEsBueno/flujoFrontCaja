import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { IconSpinnerComponent } from '../../icons';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass, IconSpinnerComponent],
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
        <app-icon-spinner class="h-4 w-4" />
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
