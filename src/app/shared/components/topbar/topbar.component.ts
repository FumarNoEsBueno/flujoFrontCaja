import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../../auth/store';
import { IconSearchComponent, IconLogoutComponent } from '../../icons';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [IconSearchComponent, IconLogoutComponent],
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
        <app-icon-search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
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
          <app-icon-logout class="w-5 h-5" />
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
