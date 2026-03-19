import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-chevron-double-right',
  standalone: true,
  template: `
    <svg [class]="class()" fill="none" viewBox="0 0 24 24" stroke="currentColor" [attr.stroke-width]="strokeWidth()">
      <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5"/>
    </svg>
  `,
})
export class IconChevronDoubleRightComponent {
  class       = input('w-5 h-5');
  strokeWidth = input(2);
}
