# AGENTS.md — Marbella · Flujo Front Caja

> Guía para agentes de código (Copilot, Claude, Cursor, etc.) trabajando en este proyecto.
> Angular 21 · Standalone · Signals · NgRx SignalStore · TanStack Query · Tailwind CSS v4

---

## 1. Build / Lint / Test commands

```bash
# Desarrollo
npm start                        # ng serve (http://localhost:4200)
npm run build                    # ng build (producción)
npm run watch                    # ng build --watch --configuration development

# Tests
npm test                         # ng test (Karma — abre navegador)
npx ng test --include='**/foo.spec.ts'   # Un solo spec por path
npx ng test --testNamePattern='should create'  # Un solo caso por nombre
```

> ⚠️ No existe configuración de ESLint todavía. Usar el compilador de Angular para detectar
> errores (`ng build` falla duro con errores de template y tipos gracias a `strictTemplates: true`).

---

## 2. Stack tecnológico

| Capa           | Tecnología                             |
| -------------- | -------------------------------------- |
| Framework      | Angular 21 (Standalone Components)     |
| Estilos        | Tailwind CSS v4                        |
| Estado global  | `@ngrx/signals` SignalStore            |
| Fetching/cache | `@tanstack/angular-query-experimental` |
| HTTP           | Angular `HttpClient` + interceptors    |
| Iconos         | `lucide-angular` + íconos custom SVG   |
| Formularios    | ReactiveFormsModule + CVA              |

---

## 3. Arquitectura y estructura de carpetas

```
src/app/
├── auth/          # Login, guards, interceptors, AuthStore
├── core/          # Layout principal, modelos globales
├── shared/
│   ├── components/  # ← COMPONENTES CUSTOM REUTILIZABLES (ver sección 5)
│   └── icons/       # ← ÍCONOS CUSTOM SVG
├── movements/     # Feature: movimientos de caja
├── users/         # Feature: usuarios
├── dashboard/     # Feature: dashboard
├── products/      # Feature: productos
└── ...            # Otras features (roles, settings, reports)
```

Cada feature tiene: `components/`, `models/`, `services/`, `*.routes.ts`.

---

## 4. Reglas de estilo y código

### TypeScript

- **Strict mode completo**: `strict`, `noImplicitOverride`, `noImplicitReturns`, `strictTemplates`.
- Siempre usar `readonly` en propiedades inyectadas: `private readonly http = inject(HttpClient)`.
- Usar `inject()` en lugar de constructor injection.
- Usar `type` imports para interfaces que no se instancian: `import type { Foo } from './foo'`.
- Tipar explícitamente los returns de funciones públicas.
- Separar tipos locales con `type Foo = ...` antes de la clase. Nunca usar `any`.

### Signals (Angular 21)

- Estado → `signal()`, derivado → `computed()`, side effects → `effect()`.
- Señales de inputs: `input()`, `input.required<T>()`, `output<T>()`.
- **Nunca usar `@Input()` / `@Output()` decorators** — ya no se usan en este proyecto.
- Nunca acceder a una señal sin invocarla: siempre `valor()`, nunca `valor`.

### Componentes

- Todos los componentes son **standalone** (`standalone: true`).
- Template inline dentro del mismo archivo `.ts` (no archivos `.html` separados).
- Selector prefijo `app-` siempre: `selector: 'app-mi-componente'`.
- Un componente por archivo.

### Imports

- Orden: Angular core → Angular libs → librerías externas → paths internos → tipos.
- Siempre importar íconos desde `../../icons` (barrel), nunca path directo.
- Siempre importar shared components desde `../../../shared/components` (barrel `index.ts`).

### Nomenclatura

- Archivos: `kebab-case.component.ts`, `kebab-case.service.ts`, `kebab-case.store.ts`.
- Clases: `PascalCase` — `MovimientoService`, `AuthStore`, `MovementsListComponent`.
- Métodos privados: `camelCase`. Métodos públicos del template: `camelCase` sin prefijo `_`.
- Señales internas (no expuestas al template padre): prefijo sin guión bajo — solo `signal()`.
- Separar secciones de código con comentarios `// ─── Nombre ───────`.

### Estilos (Tailwind CSS v4)

- **Solo clases de utilidad Tailwind**. No escribir CSS custom salvo en `styles.scss`.
- Paleta semántica del proyecto: `surface-*`, `primary-*`, `danger-*`, `success-*`, `warning-*`, `info-*`.
- Usar `ngClass` con objeto para condicionales, no concatenación de strings en template.
- Animaciones solo con clases Tailwind o CSS keyframes definidos en `styles.scss`.

### Manejo de errores

- Servicios retornan `Observable<ApiResponse<T>>` — siempre tipar la respuesta.
- En componentes con TanStack Query: usar `.isError`, `.error`, `.isPending`.
- Mostrar errores al usuario vía `ToastService` (ver sección 5).
- Nunca hacer `console.error` sin catch — manejar el error o lanzarlo.

---

## 5. ⚠️ COMPONENTES CUSTOM — REVISAR ANTES DE CREAR

**REGLA CRÍTICA**: Antes de implementar cualquier UI (tabla, input, botón, badge, modal, etc.),
verificar si ya existe un componente en `src/app/shared/components/`. Si no existe, **preguntar**
si se debe crear uno nuevo reutilizable antes de escribir HTML inline.

### Catálogo de componentes disponibles

| Componente                    | Selector                    | Cuándo usar                                                                                                                                                    |
| ----------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ButtonComponent`             | `<app-button>`              | **Todo** botón de la UI. Variantes: `primary`, `secondary`, `outline`, `ghost`, `danger`. Sizes: `sm`, `md`, `lg`. Soporta `loading`, `disabled`, `fullWidth`. |
| `InputComponent`              | `<app-input>`               | Campos de texto — implementa `ControlValueAccessor`. Integra con `ReactiveFormsModule`. Soporta `label`, `error`, `hint`, `required`.                          |
| `CardComponent`               | `<app-card>`                | Contenedor de sección. Padding: `none`, `sm`, `md` (default), `lg`. Soporta `title`, `subtitle`, `hoverable`, `divider`.                                       |
| `CustomTableComponent`        | `<app-custom-table>`        | **Toda tabla de datos**. Incluye skeleton loading, empty state, paginación y botón Excel integrado.                                                            |
| `BadgeComponent`              | `<app-badge>`               | Etiquetas de estado. Variantes: `default`, `success`, `warning`, `danger`, `info`.                                                                             |
| `CustomAutocompleteComponent` | `<app-custom-autocomplete>` | Selectores con búsqueda — implementa CVA. Usar en lugar de `<select>` nativo cuando hay búsqueda.                                                              |
| `PageHeaderComponent`         | `<app-page-header>`         | Header de cada página. `title` (required), `subtitle`. Slot de acciones vía `<ng-content>`.                                                                    |
| `ToastService`                | `inject(ToastService)`      | Notificaciones. Métodos: `.success()`, `.error()`, `.warning()`, `.info()`.                                                                                    |
| `LoadingComponent`            | `<app-loading>`             | Spinner de carga global.                                                                                                                                       |
| `RotatingCardComponent`       | `<app-rotating-card>`       | Tarjeta de métricas con carrusel automático. Útil en dashboard.                                                                                                |
| `ExcelModalComponent`         | `<app-excel-modal>`         | Modal de operaciones Excel (plantilla/exportar/importar). Configurable via `ExcelConfig`.                                                                      |

### Íconos disponibles (`src/app/shared/icons/`)

Importar siempre desde el barrel `../../icons`:

`IconSpinner`, `IconSearch`, `IconLogout`, `IconClose`, `IconCheck`, `IconWarning`,
`IconInfo`, `IconChevronDown`, `IconChevronLeft`, `IconChevronRight`, `IconChevronDoubleRight`,
`IconExcel`, `IconCopy`, `IconCheckCircle`, `IconMinus`, `IconPlus`

Uso: `<app-icon-search class="w-4 h-4 text-surface-500" />`

---

## 6. Patrones de implementación

### Tabla de datos

```typescript
// Definir columnas con TableColumn[]
columns: TableColumn[] = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'monto', label: 'Monto', align: 'right', format: (v) => `$${v}` },
];

// En template:
// <app-custom-table
//   [columns]="columns"
//   [rows]="rows()"
//   [loading]="query.isPending()"
//   [error]="query.isError() ? 'Error al cargar' : null"
//   [actions]="[{ label: 'Ver', variant: 'ghost' }]"
//   (actionClick)="onAction($event)"
// />
```

### Estado global con SignalStore

```typescript
export const MiStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({ ... })),
  withMethods((store) => { const svc = inject(MiService); return { ... }; }),
);
```

### TanStack Query en componentes

```typescript
query = injectQuery(() => ({
  queryKey: ['mi-recurso', this.filtro()],
  queryFn: () => firstValueFrom(this.service.getAll()),
}));
// Template: query.isPending(), query.isError(), query.data()
```

### Autenticación / permisos

```typescript
private readonly authStore = inject(AuthStore);
// authStore.isAuthenticated(), authStore.isAdmin()
// authStore.hasPermission('usuarios')
```

### Formularios reactivos con CVA

Usar `InputComponent` y `CustomAutocompleteComponent` directamente con `formControlName`.
Ambos implementan `ControlValueAccessor` correctamente.

---

## 7. Qué NO hacer

- ❌ No crear componentes HTML ad-hoc cuando ya existe uno en `shared/`.
- ❌ No usar `@Input()` / `@Output()` decorators — usar `input()` / `output()` signals.
- ❌ No usar `*ngIf` / `*ngFor` — usar `@if` / `@for` (control flow nativo Angular 17+).
- ❌ No usar módulos NgModule — todo es standalone.
- ❌ No acceder directamente al DOM con `document.querySelector`.
- ❌ No usar `any` — preferir `unknown` y narrowing.
- ❌ No inventar colores Tailwind — usar la paleta semántica del proyecto (`surface-*`, etc.).
- ❌ No escribir CSS inline en el template — solo clases Tailwind.
- ❌ No usar `subscribe()` dentro de otro `subscribe()` — componer con `switchMap` / `forkJoin`.
