import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ToastService } from './toast.service';
import type { Toast, ToastType } from './toast.service';
import {
  IconCheckComponent,
  IconCloseComponent,
  IconWarningComponent,
  IconInfoComponent,
} from '../../icons';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [NgClass, IconCheckComponent, IconCloseComponent, IconWarningComponent, IconInfoComponent],
  template: `
    <!-- Portal fijo top-right -->
    <div
      class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-label="Notificaciones"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          [ngClass]="toastClasses(toast)"
          class="pointer-events-auto flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)]
                 rounded-xl shadow-modal border p-4
                 transition-all duration-300 ease-out"
          role="alert"
        >
          <!-- Ícono -->
          <div [ngClass]="iconWrapperClass(toast.type)" class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5">
            @switch (toast.type) {
              @case ('success') {
                <app-icon-check class="w-4 h-4" [strokeWidth]="2.5" />
              }
              @case ('error') {
                <app-icon-close class="w-4 h-4" [strokeWidth]="2.5" />
              }
              @case ('warning') {
                <app-icon-warning class="w-4 h-4" [strokeWidth]="2.5" />
              }
              @case ('info') {
                <app-icon-info class="w-4 h-4" [strokeWidth]="2.5" />
              }
            }
          </div>

          <!-- Contenido -->
          <div class="flex-1 min-w-0">
            <p [ngClass]="titleClass(toast.type)" class="text-sm font-semibold leading-tight">
              {{ toast.title }}
            </p>
            @if (toast.message) {
              <p class="text-xs text-surface-500 mt-0.5 leading-relaxed">{{ toast.message }}</p>
            }
          </div>

          <!-- Cerrar -->
          <button
            (click)="toastService.dismiss(toast.id)"
            class="flex-shrink-0 text-surface-400 hover:text-surface-600 transition-colors
                   cursor-pointer rounded-md p-0.5 -mr-0.5 -mt-0.5"
            aria-label="Cerrar"
          >
            <app-icon-close class="w-4 h-4" [strokeWidth]="2" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);

  toastClasses(toast: Toast): Record<string, boolean> {
    const phaseClasses: Record<Toast['phase'], string> = {
      entering: 'opacity-0 translate-x-8 scale-95',
      visible:  'opacity-100 translate-x-0 scale-100',
      leaving:  'opacity-0 translate-x-8 scale-95',
    };

    const bgBorder: Record<ToastType, string> = {
      success: 'bg-white border-success-200',
      error:   'bg-white border-danger-200',
      warning: 'bg-white border-warning-200',
      info:    'bg-white border-info-200',
    };

    return {
      [phaseClasses[toast.phase]]: true,
      [bgBorder[toast.type]]: true,
    };
  }

  iconWrapperClass(type: ToastType): string {
    const map: Record<ToastType, string> = {
      success: 'bg-success-100 text-success-600',
      error:   'bg-danger-100 text-danger-600',
      warning: 'bg-warning-100 text-warning-600',
      info:    'bg-info-100 text-info-600',
    };
    return map[type];
  }

  titleClass(type: ToastType): string {
    const map: Record<ToastType, string> = {
      success: 'text-success-800',
      error:   'text-danger-800',
      warning: 'text-warning-800',
      info:    'text-info-800',
    };
    return map[type];
  }
}
