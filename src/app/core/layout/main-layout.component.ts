import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, TopbarComponent } from '../../shared/components';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="flex h-screen bg-surface-100 overflow-hidden">
      <app-sidebar />
      <div class="flex flex-col flex-1 overflow-hidden">
        <app-topbar />
        <main class="flex-1 overflow-y-auto p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {}
