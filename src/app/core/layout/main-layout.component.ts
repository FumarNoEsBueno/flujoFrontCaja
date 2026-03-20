import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { SidebarComponent, TopbarComponent } from '../../shared/components';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NgClass, SidebarComponent, TopbarComponent],
  template: `
    <div class="flex h-screen bg-surface-100 overflow-hidden">

      <!-- ─── MOBILE: overlay oscuro ─────────────────────────────────────────── -->
      @if (sidebarOpen()) {
        <div
          class="fixed inset-0 z-20 bg-black/50 lg:hidden"
          (click)="sidebarOpen.set(false)"
        ></div>
      }

      <!-- ─── MOBILE: sidebar como drawer fixed ──────────────────────────────── -->
      <div
        class="lg:hidden fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out"
        [ngClass]="sidebarOpen() ? 'translate-x-0' : '-translate-x-full'"
      >
        <app-sidebar (collapseChange)="onSidebarCollapse($event)" />
      </div>

      <!-- ─── DESKTOP: sidebar estático dentro del flex ──────────────────────── -->
      <div class="hidden lg:block shrink-0">
        <app-sidebar />
      </div>

      <!-- ─── Main area ───────────────────────────────────────────────────────── -->
      <div class="flex flex-col flex-1 overflow-hidden min-w-0">
        <app-topbar (menuClicked)="sidebarOpen.update((v) => !v)" />
        <main class="flex-1 overflow-y-auto p-4 sm:p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {
  sidebarOpen = signal(false);

  onSidebarCollapse(_collapsed: boolean): void {
    // En mobile cerramos el sidebar al navegar
    if (window.innerWidth < 1024) {
      this.sidebarOpen.set(false);
    }
  }
}
