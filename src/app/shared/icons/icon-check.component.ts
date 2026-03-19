import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-check',
  standalone: true,
  template: `
    <svg [class]="class()" fill="none" viewBox="0 0 24 24" stroke="currentColor" [attr.stroke-width]="strokeWidth()">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
    </svg>
  `,
})
export class IconCheckComponent {
  class       = input('w-5 h-5');
  strokeWidth = input(2);
}
