import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  OnDestroy,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { IconChevronLeftComponent, IconChevronRightComponent } from '../../icons';

export interface RotatingItem {
  id: number | string;
  label: string;
  sublabel?: string;
  value: string;
  badgeLabel?: string;
}

@Component({
  selector: 'app-rotating-card',
  standalone: true,
  imports: [NgClass, IconChevronLeftComponent, IconChevronRightComponent],
  template: `
    <div
      class="bg-white rounded-xl border border-surface-200 shadow-card transition-shadow duration-200 p-6 flex flex-col gap-4 min-h-[140px]"
    >
      <!-- Header: título + icono/acción -->
      <div class="flex items-start justify-between">
        <div class="flex flex-col gap-0.5 flex-1 min-w-0">
          <p class="text-sm font-medium text-surface-500 truncate">{{ title() }}</p>

          <!-- Animación fade entre items -->
          <div class="relative h-8 overflow-hidden">
            @if (currentItem(); as item) {
              <p
                class="text-2xl font-bold text-surface-900 leading-8 truncate transition-all duration-300"
                [ngClass]="{ 'opacity-0 translate-y-1': isTransitioning() }"
              >
                {{ item.value }}
              </p>
            } @else {
              <p class="text-2xl font-bold text-surface-400 leading-8">—</p>
            }
          </div>

          <!-- Sublabel (nombre de caja/local o producto) -->
          <div class="relative h-5 overflow-hidden mt-0.5">
            @if (currentItem(); as item) {
              <p
                class="text-xs text-surface-500 truncate transition-all duration-300"
                [ngClass]="{ 'opacity-0 translate-y-1': isTransitioning() }"
              >
                @if (item.sublabel) {
                  {{ item.sublabel }}
                } @else {
                  {{ item.label }}
                }
              </p>
            }
          </div>
        </div>

        <!-- Slot de icono -->
        <button
          type="button"
          class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer transition-transform duration-150 active:scale-95"
          [ngClass]="iconBgClass()"
          (click)="onIconClick()"
          [title]="iconTitle()"
        >
          <span class="text-2xl select-none">{{ icon() }}</span>
        </button>
      </div>

      <!-- Controles: flechas + dots -->
      @if (items().length > 1) {
        <div class="flex items-center justify-between gap-2">
          <!-- Flecha anterior -->
          <button
            type="button"
            class="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-400 hover:text-surface-700 hover:border-surface-400 hover:bg-surface-50 transition-all duration-150 flex-shrink-0"
            (click)="prev()"
            title="Anterior"
          >
            <app-icon-chevron-left class="w-3.5 h-3.5" [strokeWidth]="2.5" />
          </button>

          <!-- Dots indicadores -->
          <div class="flex items-center gap-1.5 flex-1 justify-center">
            @for (item of items(); track item.id; let i = $index) {
              @if (currentIndex() === i) {
                <button
                  type="button"
                  class="w-5 h-2 rounded-full bg-primary-600 transition-all duration-300 flex-shrink-0"
                  (click)="goTo(i)"
                  [title]="item.label"
                ></button>
              } @else {
                <button
                  type="button"
                  class="w-2 h-2 rounded-full bg-surface-300 hover:bg-surface-400 transition-all duration-300 flex-shrink-0"
                  (click)="goTo(i)"
                  [title]="item.label"
                ></button>
              }
            }
          </div>

          <!-- Flecha siguiente -->
          <button
            type="button"
            class="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-400 hover:text-surface-700 hover:border-surface-400 hover:bg-surface-50 transition-all duration-150 flex-shrink-0"
            (click)="next()"
            title="Siguiente"
          >
            <app-icon-chevron-right class="w-3.5 h-3.5" [strokeWidth]="2.5" />
          </button>
        </div>
      }
    </div>
  `,
})
export class RotatingCardComponent implements OnDestroy {
  // ─── Inputs ──────────────────────────────────────────────────────────────────
  title = input.required<string>();
  items = input<RotatingItem[]>([]);
  icon = input<string>('📊');
  iconBgClass = input<string>('bg-surface-50');
  iconTitle = input<string>('Ver detalle');
  intervalMs = input<number>(3000);

  // ─── Outputs ─────────────────────────────────────────────────────────────────
  iconClicked = output<RotatingItem | null>();

  // ─── State ───────────────────────────────────────────────────────────────────
  currentIndex = signal(0);
  isTransitioning = signal(false);

  currentItem = computed(() => {
    const list = this.items();
    if (!list.length) return null;
    return list[this.currentIndex()] ?? null;
  });

  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Reiniciar timer cuando cambia la lista
    effect(() => {
      const list = this.items();
      this.currentIndex.set(0);
      this.stopTimer();
      if (list.length > 1) {
        this.startTimer();
      }
    });
  }

  // ─── Navegación ──────────────────────────────────────────────────────────────
  next(): void {
    this.animateTo((this.currentIndex() + 1) % this.items().length);
    this.restartTimer();
  }

  prev(): void {
    const len = this.items().length;
    this.animateTo((this.currentIndex() - 1 + len) % len);
    this.restartTimer();
  }

  goTo(index: number): void {
    if (index === this.currentIndex()) return;
    this.animateTo(index);
    this.restartTimer();
  }

  onIconClick(): void {
    this.iconClicked.emit(this.currentItem());
  }

  // ─── Animación ───────────────────────────────────────────────────────────────
  private animateTo(index: number): void {
    this.isTransitioning.set(true);
    setTimeout(() => {
      this.currentIndex.set(index);
      this.isTransitioning.set(false);
    }, 150);
  }

  // ─── Timer ───────────────────────────────────────────────────────────────────
  private startTimer(): void {
    this.timer = setInterval(() => {
      this.animateTo((this.currentIndex() + 1) % this.items().length);
    }, this.intervalMs());
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private restartTimer(): void {
    this.stopTimer();
    if (this.items().length > 1) {
      this.startTimer();
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}
