import { Component, inject, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../auth/store';
import { IconSearchComponent, IconLogoutComponent, IconUserComponent } from '../../icons';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [IconSearchComponent, IconLogoutComponent, IconUserComponent, RouterLink],
  template: `
    <header
      class="h-16 bg-white border-b border-surface-200 px-4 sm:px-6 flex items-center justify-between shrink-0"
    >
      <!-- Left: Hamburger (mobile) + Search -->
      <div class="flex items-center gap-3">
        <!-- Botón hamburguesa — solo visible en mobile -->
        <button
          type="button"
          class="lg:hidden p-2 -ml-1 text-surface-500 hover:text-surface-700
                 hover:bg-surface-100 rounded-lg transition-colors cursor-pointer"
          (click)="menuClicked.emit()"
          title="Menú"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" stroke-width="1.5" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <!-- Search — oculto en mobile chico, visible desde sm -->
        <div class="relative hidden sm:block">
          <input
            type="text"
            placeholder="Buscar..."
            class="w-48 md:w-64 pl-9 pr-4 py-2 bg-surface-100 border border-surface-200 rounded-lg text-sm
                   placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500
                   focus:border-primary-500 transition-colors"
          />
          <app-icon-search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        </div>
      </div>

      <!-- Right: User -->
      <div class="flex items-center gap-3 pl-4 border-l border-surface-200">
        <!-- Nombre y rol -->
        <a
          [routerLink]="['/perfil']"
          class="hidden sm:flex items-center gap-2 rounded-lg px-2 py-1 -mx-2 -my-1
                 hover:bg-surface-100 transition-colors cursor-pointer"
          title="Ver mi perfil"
        >
          <app-icon-user class="w-5 h-5 text-surface-400 flex-shrink-0" />
          <div class="text-right">
            <p class="text-sm font-medium text-surface-900 leading-tight">
              {{ authStore.userName() || 'Cargando...' }}
            </p>
            <p class="text-xs text-surface-500">
              {{ authStore.userRole() || 'Sin rol' }}
            </p>
          </div>
        </a>

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

  menuClicked = output<void>();

  logout(): void {
    this.authStore.logout();
    this.router.navigate(['/auth/login']);
  }
}
