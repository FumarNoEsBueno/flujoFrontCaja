import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-close',
  standalone: true,
  template: `
    <svg [class]="class()" fill="none" viewBox="0 0 24 24" stroke="currentColor" [attr.stroke-width]="strokeWidth()">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  `,
})
export class IconCloseComponent {
  class       = input('w-5 h-5');
  strokeWidth = input(2);
}
