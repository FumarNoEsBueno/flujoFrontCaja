import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-excel',
  standalone: true,
  template: `
    <svg [class]="class()" fill="none" viewBox="0 0 24 24" stroke="currentColor" [attr.stroke-width]="strokeWidth()">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M9 17v-6l-2 2m0 0l2 2m4-4v6m0 0l2-2m-2 2l-2-2M3 7h18M3 12h18"/>
    </svg>
  `,
})
export class IconExcelComponent {
  class       = input('w-5 h-5');
  strokeWidth = input(2);
}
