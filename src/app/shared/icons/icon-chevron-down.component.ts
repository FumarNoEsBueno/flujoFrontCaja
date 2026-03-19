import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-chevron-down',
  standalone: true,
  template: `
    <svg [class]="class()" fill="none" viewBox="0 0 24 24" stroke="currentColor" [attr.stroke-width]="strokeWidth()">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
    </svg>
  `,
})
export class IconChevronDownComponent {
  class       = input('w-5 h-5');
  strokeWidth = input(2);
}
