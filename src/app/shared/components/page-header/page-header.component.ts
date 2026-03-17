import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-surface-900">{{ title() }}</h1>
          @if (subtitle()) {
            <p class="mt-1 text-sm text-surface-500">{{ subtitle() }}</p>
          }
        </div>
        <div class="flex items-center gap-3">
          <ng-content />
        </div>
      </div>
    </div>
  `,
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input('');
}
