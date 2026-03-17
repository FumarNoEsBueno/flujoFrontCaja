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
      <!-- Left: Breadcrumb / Search Area -->
      <div class="flex items-center gap-4">
        <div class="relative">
          <input
            type="text"
            placeholder="Buscar..."
            class="w-64 pl-9 pr-4 py-2 bg-surface-100 border border-surface-200 rounded-lg text-sm
                   placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500
                   focus:border-primary-500 transition-colors"
          />
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm">🔍</span>
        </div>
      </div>

      <!-- Right: User Menu -->
      <div class="flex items-center gap-4">
        <!-- Notifications -->
        <button
          class="relative p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-colors"
        >
          <span class="text-lg">🔔</span>
          <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full"></span>
        </button>

        <!-- User Profile Dropdown -->
        <div class="flex items-center gap-3 pl-4 border-l border-surface-200">
          <div class="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-sm font-semibold text-primary-700">
              {{ getInitials() }}
            </span>
          </div>
          <div class="hidden sm:block">
            <p class="text-sm font-medium text-surface-900 leading-tight">
              {{ authStore.userName() || 'Usuario' }}
            </p>
            <p class="text-xs text-surface-500">
              {{ authStore.userRole() || 'Sin rol' }}
            </p>
          </div>
          <button
            (click)="logout()"
            class="p-2 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors cursor-pointer"
            title="Cerrar sesión"
          >
            <span class="text-base">🚪</span>
          </button>
        </div>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  getInitials(): string {
    const name = this.authStore.userName();
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  logout(): void {
    this.authStore.logout();
    this.router.navigate(['/auth/login']);
  }
}
