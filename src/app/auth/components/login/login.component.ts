import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent, InputComponent } from '../../../shared/components';
import { AuthStore } from '../../store';
import { AuthService } from '../../services';

// ─── Helpers de RUT ───────────────────────────────────────────────────────────
/** Elimina puntos y deja sólo dígitos + dígito verificador (sin guión).
 *  Ej: "12.345.678-9" → "123456789"  |  "12345678-9" → "123456789"
 */
function sanitizeRut(raw: string): string {
  return raw.replace(/\./g, '').replace(/-/g, '').trim();
}

/** Formatea un RUT ingresado para mostrar "12.345.678-9" mientras el usuario escribe.
 *  Acepta como entrada cualquier string con o sin puntos/guión.
 */
function formatRut(raw: string): string {
  const clean = raw.replace(/[^0-9kK]/g, '');
  if (clean.length === 0) return '';
  const dv = clean.slice(-1);
  const body = clean.slice(0, -1);
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return withDots ? `${withDots}-${dv}` : dv;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="min-h-screen flex bg-surface-100">
      <!-- Left Panel: Branding -->
      <div class="hidden lg:flex lg:w-1/2 bg-primary-950 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-primary-900/90 to-primary-950"></div>
        <div class="relative z-10 flex flex-col justify-center px-16">
          <div class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
            <span class="text-3xl font-bold text-white">M</span>
          </div>
          <h1 class="text-4xl font-bold text-white mb-4">Marbella</h1>
          <p class="text-xl text-primary-200 mb-2">Sistema de Gestión de Cajas</p>
          <p class="text-primary-300/70 max-w-md leading-relaxed">
            Administra tus movimientos, controla tu caja y genera reportes de forma simple y
            eficiente.
          </p>

          <!-- Decorative elements -->
          <div class="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full"></div>
          <div class="absolute top-20 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
        </div>
      </div>

      <!-- Right Panel: Login Form -->
      <div class="flex-1 flex items-center justify-center px-6 py-12">
        <div class="w-full max-w-md">
          <!-- Mobile Logo -->
          <div class="lg:hidden text-center mb-10">
            <div
              class="w-14 h-14 bg-primary-950 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <span class="text-2xl font-bold text-white">M</span>
            </div>
            <h1 class="text-2xl font-bold text-surface-900">Marbella</h1>
          </div>

          <div>
            <h2 class="text-2xl font-bold text-surface-900 mb-1">Iniciar Sesión</h2>
            <p class="text-surface-500 mb-8">Ingresá tus credenciales para acceder al sistema</p>
          </div>

          @if (errorMessage()) {
            <div class="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg">
              <p class="text-sm text-danger-700">{{ errorMessage() }}</p>
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <app-input
              label="RUT"
              type="text"
              placeholder="12.345.678-9"
              [required]="true"
              formControlName="rut"
              [error]="getFieldError('rut')"
            />

            <app-input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              [required]="true"
              formControlName="password"
              [error]="getFieldError('password')"
            />

            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  formControlName="remember"
                  class="w-4 h-4 rounded border-surface-300 text-primary-600
                         focus:ring-primary-500 cursor-pointer"
                />
                <span class="text-sm text-surface-600">Recordarme</span>
              </label>
              <a href="#" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <app-button
              type="submit"
              [fullWidth]="true"
              [loading]="authStore.isLoading()"
              [disabled]="loginForm.invalid"
              size="lg"
            >
              Iniciar Sesión
            </app-button>
          </form>

          <p class="mt-8 text-center text-xs text-surface-400">
            Marbella © {{ currentYear }}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  errorMessage = signal('');
  currentYear = new Date().getFullYear();

  loginForm = this.fb.nonNullable.group({
    rut: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [false],
  });

  constructor() {
    // ─── Formateo de RUT en tiempo real ──────────────────────────────────────
    this.loginForm.get('rut')?.valueChanges.subscribe((raw) => {
      const formatted = formatRut(raw ?? '');
      if (formatted !== raw) {
        this.loginForm.get('rut')?.setValue(formatted, { emitEvent: false });
      }
    });
  }

  getFieldError(field: 'rut' | 'password'): string {
    const control = this.loginForm.get(field);
    if (!control?.touched || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['minlength']) return 'Mínimo 6 caracteres';

    return '';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.authStore.setLoading();

    const { rut, password } = this.loginForm.getRawValue();
    // Enviamos el RUT limpio (sin puntos ni guión) al backend
    const rutLimpio = sanitizeRut(rut);

    this.authService.login({ rut: rutLimpio, password }).subscribe({
      next: (response) => {
        if (response.success) {
          this.authStore.setAuthenticated(response.data);
          this.fetchUserProfile();
        } else {
          this.authStore.setError(response.message);
          this.errorMessage.set(response.message);
        }
      },
      error: (err) => {
        const message = err?.error?.message || 'Error al iniciar sesión. Intentá nuevamente.';
        this.authStore.setError(message);
        this.errorMessage.set(message);
      },
    });
  }

  /**
   * Después del login, llama a /auth/me para obtener datos del usuario + permisos.
   * Los guarda en el store (que a su vez los persiste en localStorage).
   */
  private fetchUserProfile(): void {
    this.authService.me().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.authStore.setUserData(response.data);
        }
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        // Aún sin perfil, dejamos pasar al dashboard
        this.router.navigate(['/dashboard']);
      },
    });
  }
}
