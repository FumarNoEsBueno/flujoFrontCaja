import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { AuthStore } from '../../../auth/store';
import { NavItem } from '../../../core/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  template: `
    <aside
      [ngClass]="{ 'w-64': !collapsed(), 'w-[72px]': collapsed() }"
      class="h-full bg-primary-950 text-white flex flex-col transition-all duration-300 ease-in-out"
    >
      <!-- Logo Area -->
      <div class="flex items-center gap-3 px-4 h-16 border-b border-primary-800/50">
        <div class="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
          <span class="text-lg font-bold text-white">M</span>
        </div>
        @if (!collapsed()) {
          <span class="text-lg font-bold tracking-tight whitespace-nowrap">Marbella</span>
        }
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <p class="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-primary-400"
           [ngClass]="{ 'text-center': collapsed() }">
          {{ collapsed() ? '•' : 'Principal' }}
        </p>

        @for (item of mainNavItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="bg-white/15 text-white"
            [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
            [ngClass]="{ 'justify-center': collapsed() }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-primary-200
                   hover:bg-white/10 hover:text-white transition-colors duration-150 group"
          >
            <span class="text-lg shrink-0" [innerHTML]="item.icon"></span>
            @if (!collapsed()) {
              <span class="whitespace-nowrap">{{ item.label }}</span>
            }
          </a>
        }

        @if (authStore.isAdmin()) {
          <p class="px-3 mt-6 mb-2 text-[10px] font-semibold uppercase tracking-wider text-primary-400"
             [ngClass]="{ 'text-center': collapsed() }">
            {{ collapsed() ? '•' : 'Administración' }}
          </p>

          @for (item of adminNavItems; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-white/15 text-white"
              [ngClass]="{ 'justify-center': collapsed() }"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-primary-200
                     hover:bg-white/10 hover:text-white transition-colors duration-150 group"
            >
              <span class="text-lg shrink-0" [innerHTML]="item.icon"></span>
              @if (!collapsed()) {
                <span class="whitespace-nowrap">{{ item.label }}</span>
              }
            </a>
          }
        }
      </nav>

      <!-- Collapse Button -->
      <div class="p-3 border-t border-primary-800/50">
        <button
          (click)="toggleCollapse()"
          class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm
                 text-primary-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <span class="text-lg">{{ collapsed() ? '→' : '←' }}</span>
          @if (!collapsed()) {
            <span>Colapsar</span>
          }
        </button>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  readonly authStore = inject(AuthStore);
  collapsed = signal(false);

  mainNavItems: NavItem[] = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'Movimientos', icon: '💰', route: '/movements' },
    { label: 'Reportes', icon: '📋', route: '/reports' },
  ];

  adminNavItems: NavItem[] = [
    { label: 'Productos', icon: '📦', route: '/products', adminOnly: true },
    { label: 'Usuarios', icon: '👥', route: '/users', adminOnly: true },
    { label: 'Roles', icon: '🔑', route: '/roles', adminOnly: true },
    { label: 'Configuración', icon: '⚙️', route: '/settings', adminOnly: true },
  ];

  toggleCollapse(): void {
    this.collapsed.update((v) => !v);
  }
}
