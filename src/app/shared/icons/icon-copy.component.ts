import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-copy',
  standalone: true,
  template: `
    <svg [class]="class()" fill="none" viewBox="0 0 24 24" stroke="currentColor" [attr.stroke-width]="strokeWidth()">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  `,
})
export class IconCopyComponent {
  class       = input('w-5 h-5');
  strokeWidth = input(2);
}
