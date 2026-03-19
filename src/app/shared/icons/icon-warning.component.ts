import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-warning',
  standalone: true,
  template: `
    <svg [class]="class()" fill="none" viewBox="0 0 24 24" stroke="currentColor" [attr.stroke-width]="strokeWidth()">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    </svg>
  `,
})
export class IconWarningComponent {
  class       = input('w-5 h-5');
  strokeWidth = input(2);
}
