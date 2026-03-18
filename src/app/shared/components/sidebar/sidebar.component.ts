import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { AuthStore } from '../../../auth/store';

interface SidebarNavItem {
  label: string;
  /** SVG path(s) como string — se inyecta con innerHTML */
  icon: string;
  route: string;
  /** Permiso requerido para ver este item (debe coincidir con perm_nombre en la BD) */
  permiso: string;
}

/** SVG plano 24×24, stroke currentColor, stroke-width 1.5, sin relleno */
const icon = (paths: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
       stroke="currentColor" stroke-width="1.5" class="w-5 h-5">${paths}</svg>`;

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  template: `
    <aside
      [ngClass]="{ 'w-64': !collapsed(), 'w-[72px]': collapsed() }"
      class="h-full bg-primary-950 text-white flex flex-col transition-all duration-300 ease-in-out"
    >
      <!-- Logo -->
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
        @if (visibleMainItems().length) {
          <p class="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-primary-400"
             [ngClass]="{ 'text-center': collapsed() }">
            {{ collapsed() ? '·' : 'Principal' }}
          </p>

          @for (item of visibleMainItems(); track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-white/15 text-white"
              [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
              [ngClass]="{ 'justify-center': collapsed() }"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-primary-300
                     hover:bg-white/10 hover:text-white transition-colors duration-150"
              [title]="collapsed() ? item.label : ''"
            >
              <span class="shrink-0" [innerHTML]="item.icon"></span>
              @if (!collapsed()) {
                <span class="whitespace-nowrap">{{ item.label }}</span>
              }
            </a>
          }
        }

        @if (visibleAdminItems().length) {
          <p class="px-3 mt-6 mb-2 text-[10px] font-semibold uppercase tracking-wider text-primary-400"
             [ngClass]="{ 'text-center': collapsed() }">
            {{ collapsed() ? '·' : 'Administración' }}
          </p>

          @for (item of visibleAdminItems(); track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-white/15 text-white"
              [ngClass]="{ 'justify-center': collapsed() }"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-primary-300
                     hover:bg-white/10 hover:text-white transition-colors duration-150"
              [title]="collapsed() ? item.label : ''"
            >
              <span class="shrink-0" [innerHTML]="item.icon"></span>
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
          [title]="collapsed() ? 'Expandir' : ''"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"
               class="w-5 h-5 transition-transform duration-300"
               [ngClass]="{ 'rotate-180': !collapsed() }">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
          </svg>
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

  private readonly mainNavItems: SidebarNavItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      permiso: 'dashboard',
      icon: icon(`
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z"/>
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25z"/>
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z"/>
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>
      `),
    },
    {
      label: 'Movimientos',
      route: '/movements',
      permiso: 'movimientos',
      icon: icon(`
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75"/>
      `),
    },
    {
      label: 'Reportes',
      route: '/reports',
      permiso: 'reportes',
      icon: icon(`
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"/>
      `),
    },
  ];

  private readonly adminNavItems: SidebarNavItem[] = [
    {
      label: 'Productos',
      route: '/products',
      permiso: 'productos',
      icon: icon(`
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
      `),
    },
    {
      label: 'Usuarios',
      route: '/users',
      permiso: 'usuarios',
      icon: icon(`
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
      `),
    },
    {
      label: 'Roles',
      route: '/roles',
      permiso: 'roles',
      icon: icon(`
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
      `),
    },
    {
      label: 'Configuración',
      route: '/settings',
      permiso: 'roles',
      icon: icon(`
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/>
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      `),
    },
  ];

  visibleMainItems = computed(() =>
    this.mainNavItems.filter((item) => this.authStore.hasPermission(item.permiso)),
  );

  visibleAdminItems = computed(() =>
    this.adminNavItems.filter((item) => this.authStore.hasPermission(item.permiso)),
  );

  toggleCollapse(): void {
    this.collapsed.update((v) => !v);
  }
}
