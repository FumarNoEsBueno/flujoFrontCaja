import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span
      [ngClass]="badgeClasses()"
      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
    >
      <ng-content />
    </span>
  `,
})
export class BadgeComponent {
  variant = input<BadgeVariant>('default');

  badgeClasses() {
    const variants: Record<BadgeVariant, string> = {
      default: 'bg-surface-100 text-surface-700',
      success: 'bg-success-50 text-success-700',
      warning: 'bg-warning-50 text-warning-700',
      danger: 'bg-danger-50 text-danger-700',
      info: 'bg-info-50 text-info-700',
    };
    return variants[this.variant()];
  }
}
