import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-info',
  standalone: true,
  template: `
    <svg [class]="class()" fill="none" viewBox="0 0 24 24" stroke="currentColor" [attr.stroke-width]="strokeWidth()">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z"/>
    </svg>
  `,
})
export class IconInfoComponent {
  class       = input('w-5 h-5');
  strokeWidth = input(2);
}
