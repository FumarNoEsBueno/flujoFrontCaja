import { Injectable, signal, computed } from '@angular/core';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  /** ms antes del auto-dismiss. 0 = nunca. Default: 4000 */
  duration: number;
  /** Fase de animación: 'entering' | 'visible' | 'leaving' */
  phase: 'entering' | 'visible' | 'leaving';
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);

  readonly toasts = computed(() => this._toasts());

  // ─── Public API ───────────────────────────────────────────────────────────

  success(title: string, message?: string, duration = 4000): void {
    this.add('success', title, message, duration);
  }

  error(title: string, message?: string, duration = 5000): void {
    this.add('error', title, message, duration);
  }

  warning(title: string, message?: string, duration = 4500): void {
    this.add('warning', title, message, duration);
  }

  info(title: string, message?: string, duration = 4000): void {
    this.add('info', title, message, duration);
  }

  dismiss(id: string): void {
    // Fase leaving → animar salida → remover
    this._toasts.update((list) =>
      list.map((t) => (t.id === id ? { ...t, phase: 'leaving' as const } : t)),
    );
    setTimeout(() => {
      this._toasts.update((list) => list.filter((t) => t.id !== id));
    }, 350); // duración de la animación de salida
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private add(
    type: ToastType,
    title: string,
    message?: string,
    duration = 4000,
  ): void {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const toast: Toast = { id, type, title, message, duration, phase: 'entering' };
    this._toasts.update((list) => [...list, toast]);

    // entering → visible tras 1 frame (permite que el CSS lo vea desde fuera del DOM)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._toasts.update((list) =>
          list.map((t) => (t.id === id ? { ...t, phase: 'visible' as const } : t)),
        );
      });
    });

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }
}
