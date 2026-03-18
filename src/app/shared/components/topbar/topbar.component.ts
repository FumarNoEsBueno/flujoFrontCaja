import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../../auth/store';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header
      class="h-16 bg-white border-b border-surface-200 px-6 flex items-center justify-between shrink-0"
    >
      <!-- Left: Search -->
      <div class="relative">
        <input
          type="text"
          placeholder="Buscar..."
          class="w-64 pl-9 pr-4 py-2 bg-surface-100 border border-surface-200 rounded-lg text-sm
                 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500
                 focus:border-primary-500 transition-colors"
        />
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <!-- Right: User -->
      <div class="flex items-center gap-3 pl-4 border-l border-surface-200">
        <!-- Nombre y rol -->
        <div class="hidden sm:block text-right">
          <p class="text-sm font-medium text-surface-900 leading-tight">
            {{ authStore.userName() || 'Cargando...' }}
          </p>
          <p class="text-xs text-surface-500">
            {{ authStore.userRole() || 'Sin rol' }}
          </p>
        </div>

        <!-- Logout -->
        <button
          (click)="logout()"
          class="p-2 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors cursor-pointer"
          title="Cerrar sesión"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  logout(): void {
    this.authStore.logout();
    this.router.navigate(['/auth/login']);
  }
}
