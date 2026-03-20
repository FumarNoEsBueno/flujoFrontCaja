import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgClass],
  host: { class: 'block' },
  template: `
    <div
      [ngClass]="{
        'p-4': padding() === 'sm',
        'p-6': padding() === 'md',
        'p-8': padding() === 'lg',
        'p-0': padding() === 'none',
        'hover:shadow-card-hover': hoverable(),
        'flex flex-col h-full': stretch(),
      }"
      class="bg-white rounded-xl border border-surface-200 shadow-card transition-shadow duration-200"
    >
      @if (title()) {
        <div class="mb-4" [ngClass]="{ 'border-b border-surface-200 pb-4': divider() }">
          <h3 class="text-lg font-semibold text-surface-900">{{ title() }}</h3>
          @if (subtitle()) {
            <p class="text-sm text-surface-500 mt-0.5">{{ subtitle() }}</p>
          }
        </div>
      }
      <ng-content />
    </div>
  `,
})
export class CardComponent {
  title = input('');
  subtitle = input('');
  padding = input<'none' | 'sm' | 'md' | 'lg'>('md');
  hoverable = input(false);
  divider = input(false);
  stretch = input(false);
}
