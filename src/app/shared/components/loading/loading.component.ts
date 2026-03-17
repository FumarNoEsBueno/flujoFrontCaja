import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    <div class="flex items-center justify-center" [style.min-height]="minHeight()">
      <div class="flex flex-col items-center gap-3">
        <div class="relative">
          <div class="w-10 h-10 border-4 border-surface-200 rounded-full"></div>
          <div class="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
        </div>
        @if (message()) {
          <p class="text-sm text-surface-500">{{ message() }}</p>
        }
      </div>
    </div>
  `,
})
export class LoadingComponent {
  message = input('');
  minHeight = input('200px');
}
