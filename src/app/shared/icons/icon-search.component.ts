import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-search',
  standalone: true,
  template: `
    <svg [class]="class()" fill="none" viewBox="0 0 24 24" stroke="currentColor" [attr.stroke-width]="strokeWidth()">
      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
    </svg>
  `,
})
export class IconSearchComponent {
  class       = input('w-5 h-5');
  strokeWidth = input(2);
}
