# PROMPT PARA OPENCODE: Mejora Frontend Huerta Digital (Angular)

## CONTEXTO DEL PROYECTO
Estoy desarrollando "Huerta Digital", una aplicación de gestión de huerta/jardín con Angular. Tengo un diseño existente pero quiero mejorarlo completamente basándome en wireframes profesionales que incluyen versión clara y oscura.

## OBJETIVO
Mejorar completamente el frontend actual implementando:
- Nueva estructura de componentes modular y reutilizable
- Sistema de diseño consistente con tema claro/oscuro
- Todas las vistas principales según wireframes
- Mejores prácticas de Angular y UX

---

## ANÁLISIS DE WIREFRAMES - SISTEMA DE DISEÑO

### PALETA DE COLORES

#### Tema Oscuro
```scss
// Colores base
$dark-bg-primary: #0a1f1a;        // Fondo principal
$dark-bg-secondary: #1a2e28;       // Fondo secundario (sidebar)
$dark-bg-card: #1a3329;            // Fondo de tarjetas
$dark-surface: #2a4a3f;            // Superficie elevada

// Verde principal (brand)
$primary-green: #4ade80;           // Verde claro para acentos
$primary-green-dark: #22c55e;      // Verde medio
$primary-green-darker: #16a34a;    // Verde oscuro

// Colores por tipo de tarea
$color-riego: #3b82f6;             // Azul
$color-cosecha: #ef4444;           // Rojo
$color-poda: #f59e0b;              // Amarillo/Naranja
$color-abonado: #78350f;           // Marrón oscuro
$color-tratamiento: #a855f7;       // Morado
$color-inspeccion: #dc2626;        // Rojo oscuro

// Estados
$color-pendiente: #3b82f6;         // Azul
$color-urgente: #ef4444;           // Rojo
$color-lista: #f59e0b;             // Amarillo
$color-completada: #22c55e;        // Verde
$color-aplazada: #78350f;          // Marrón

// Texto
$text-primary: #f0fdf4;            // Texto principal
$text-secondary: #86efac;          // Texto secundario
$text-muted: #6b7280;              // Texto deshabilitado
```

#### Tema Claro
```scss
// Colores base
$light-bg-primary: #f9fafb;        // Fondo principal
$light-bg-secondary: #d1f4e0;      // Fondo secundario (sidebar)
$light-bg-card: #ffffff;           // Fondo de tarjetas
$light-surface: #f3f4f6;           // Superficie elevada

// Verde principal (brand) - más oscuro en tema claro
$primary-green-light: #16a34a;     // Verde principal
$primary-green-medium: #15803d;    // Verde medio
$primary-green-dark: #14532d;      // Verde oscuro

// Texto (invertido)
$text-primary-light: #111827;      // Texto principal
$text-secondary-light: #16a34a;    // Texto secundario
$text-muted-light: #6b7280;        // Texto deshabilitado

// Los colores de tareas y estados se mantienen similares pero ajustados para contraste
```

### TIPOGRAFÍA
```scss
// Familia de fuentes
$font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

// Tamaños
$font-size-xs: 0.75rem;    // 12px - Etiquetas pequeñas
$font-size-sm: 0.875rem;   // 14px - Texto secundario
$font-size-base: 1rem;     // 16px - Texto base
$font-size-lg: 1.125rem;   // 18px - Subtítulos
$font-size-xl: 1.25rem;    // 20px - Títulos de sección
$font-size-2xl: 1.5rem;    // 24px - Títulos principales

// Pesos
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
```

### ESPACIADO Y LAYOUT
```scss
// Espaciado (sistema de 4px)
$spacing-1: 0.25rem;   // 4px
$spacing-2: 0.5rem;    // 8px
$spacing-3: 0.75rem;   // 12px
$spacing-4: 1rem;      // 16px
$spacing-5: 1.25rem;   // 20px
$spacing-6: 1.5rem;    // 24px
$spacing-8: 2rem;      // 32px
$spacing-10: 2.5rem;   // 40px

// Bordes
$border-radius-sm: 0.375rem;   // 6px
$border-radius-md: 0.5rem;     // 8px
$border-radius-lg: 0.75rem;    // 12px
$border-radius-xl: 1rem;       // 16px

// Sombras
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

---

## ESTRUCTURA DE COMPONENTES ANGULAR

### Arquitectura de Carpetas Propuesta
```
src/app/
├── core/
│   ├── services/
│   │   ├── theme.service.ts          # Gestión tema claro/oscuro
│   │   ├── huerta.service.ts
│   │   ├── cultivo.service.ts
│   │   ├── parcela.service.ts
│   │   └── tarea.service.ts
│   ├── models/
│   │   ├── huerta.model.ts
│   │   ├── cultivo.model.ts
│   │   ├── parcela.model.ts
│   │   └── tarea.model.ts
│   └── interceptors/
│       └── auth.interceptor.ts
│
├── shared/
│   ├── components/
│   │   ├── sidebar/                   # Navegación lateral
│   │   ├── header/                    # Barra superior
│   │   ├── theme-toggle/              # Switch tema claro/oscuro
│   │   ├── stat-card/                 # Tarjetas de estadísticas
│   │   ├── task-badge/                # Badges de tareas
│   │   ├── progress-bar/              # Barras de progreso
│   │   ├── weather-widget/            # Widget de clima
│   │   └── empty-state/               # Estados vacíos
│   ├── directives/
│   └── pipes/
│       ├── task-type-icon.pipe.ts     # Íconos según tipo tarea
│       └── task-color.pipe.ts         # Color según tipo tarea
│
├── features/
│   ├── dashboard/
│   │   ├── dashboard.component.ts
│   │   └── dashboard.component.html
│   │
│   ├── calendario/
│   │   ├── calendario.component.ts
│   │   ├── components/
│   │   │   ├── calendar-header/
│   │   │   ├── calendar-week-view/
│   │   │   └── task-event-card/
│   │   └── calendario.component.html
│   │
│   ├── cultivos/
│   │   ├── cultivos-list/
│   │   ├── cultivo-detail/
│   │   │   ├── cultivo-detail.component.ts
│   │   │   ├── components/
│   │   │   │   ├── growth-timeline/     # Timeline de crecimiento
│   │   │   │   ├── irrigation-card/     # Tarjeta recomendaciones riego
│   │   │   │   └── task-list/           # Lista tareas del cultivo
│   │   │   └── cultivo-detail.component.html
│   │   └── cultivo-form/
│   │
│   ├── parcelas/
│   │   ├── parcelas-list/
│   │   │   └── components/
│   │   │       └── parcela-card/        # Tarjeta resumen parcela
│   │   ├── parcela-detail/
│   │   │   ├── parcela-detail.component.ts
│   │   │   ├── components/
│   │   │   │   ├── parcela-map/         # Mapa visual de zonas
│   │   │   │   ├── zone-card/           # Tarjeta de cada zona
│   │   │   │   └── parcela-stats/       # Estadísticas parcela
│   │   │   └── parcela-detail.component.html
│   │   └── parcela-form/
│   │
│   └── tareas/
│       ├── tareas-list/
│       │   ├── tareas-list.component.ts
│       │   ├── components/
│       │   │   ├── task-filters/        # Filtros de tareas
│       │   │   ├── task-stats/          # Estadísticas superiores
│       │   │   └── task-item/           # Item individual
│       │   └── tareas-list.component.html
│       └── tarea-form/
│
└── styles/
    ├── _variables.scss                # Variables de diseño
    ├── _themes.scss                   # Definición de temas
    ├── _mixins.scss                   # Mixins reutilizables
    └── styles.scss                    # Estilos globales
```

---

## COMPONENTES PRINCIPALES - ESPECIFICACIONES

### 1. SIDEBAR (Navegación Lateral)

**Características:**
- Fondo verde oscuro/claro según tema
- Logo en la parte superior
- Información de la huerta activa
- Menú de navegación con iconos
- Usuario en la parte inferior
- Ancho fijo: 240px

**Estructura HTML:**
```html
<aside class="sidebar">
  <!-- Logo y título -->
  <div class="sidebar-header">
    <div class="logo">
      <img src="assets/logo.svg" alt="Huerta Digital">
    </div>
    <span class="app-name">Huerta Digital</span>
  </div>

  <!-- Información huerta activa -->
  <div class="active-huerta">
    <div class="huerta-icon">🌱</div>
    <div class="huerta-info">
      <h3>Huerta La Solana</h3>
      <p class="huerta-location">Zaragoza - Zona mediterránea</p>
      <span class="huerta-role">Propietario</span>
    </div>
  </div>

  <!-- Navegación principal -->
  <nav class="sidebar-nav">
    <div class="nav-section">
      <span class="section-title">PRINCIPAL</span>
      <a routerLink="/dashboard" routerLinkActive="active">
        <i class="icon-dashboard"></i>
        <span>Dashboard</span>
      </a>
      <a routerLink="/calendario" routerLinkActive="active">
        <i class="icon-calendar"></i>
        <span>Calendario</span>
      </a>
      <a routerLink="/cultivos" routerLinkActive="active">
        <i class="icon-plant"></i>
        <span>Cultivos</span>
      </a>
      <a routerLink="/parcelas" routerLinkActive="active">
        <i class="icon-grid"></i>
        <span>Parcelas</span>
      </a>
    </div>

    <div class="nav-section">
      <span class="section-title">GESTIÓN</span>
      <a routerLink="/tareas" routerLinkActive="active">
        <i class="icon-check"></i>
        <span>Tareas</span>
      </a>
      <a routerLink="/rotaciones" routerLinkActive="active">
        <i class="icon-rotate"></i>
        <span>Rotaciones</span>
      </a>
      <a routerLink="/meteorologia" routerLinkActive="active">
        <i class="icon-cloud"></i>
        <span>Meteorología</span>
      </a>
    </div>

    <div class="nav-section">
      <span class="section-title">ANÁLISIS</span>
      <a routerLink="/informes" routerLinkActive="active">
        <i class="icon-chart"></i>
        <span>Informes</span>
      </a>
      <a routerLink="/ajustes" routerLinkActive="active">
        <i class="icon-settings"></i>
        <span>Ajustes</span>
      </a>
    </div>
  </nav>

  <!-- Usuario -->
  <div class="sidebar-user">
    <div class="user-avatar">SS</div>
    <div class="user-info">
      <span class="user-name">Sergio S.</span>
      <span class="user-role">Propietario</span>
    </div>
  </div>
</aside>
```

### 2. CALENDARIO (Vista Semanal)

**Características:**
- Vista semanal con columnas por día
- Header con selector de vista (Mes/Semana/Cultivo)
- Eventos de tareas con colores según tipo
- Calendario mensual pequeño en la derecha
- Estadísticas de la semana
- Previsión meteorológica

**Componente Principal:**
```typescript
@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss']
})
export class CalendarioComponent implements OnInit {
  currentDate: Date = new Date();
  weekDays: Date[] = [];
  tasks: Tarea[] = [];
  viewMode: 'month' | 'week' | 'cultivo' = 'week';
  
  weekStats = {
    totalTasks: 12,
    completed: 7,
    cumplimiento: 58,
    riego: 100,
    tratamientos: 25
  };

  ngOnInit() {
    this.loadWeekDays();
    this.loadTasks();
  }

  loadWeekDays() {
    // Generar array de días de la semana
  }

  getTasksForDay(date: Date): Tarea[] {
    // Filtrar tareas por día
  }

  getTaskColor(taskType: string): string {
    // Retornar color según tipo de tarea
  }
}
```

**Eventos de Tarea (task-event-card):**
```html
<div class="task-event" 
     [ngClass]="'task-type-' + task.type"
     [style.top.px]="getTaskPosition(task.time)"
     [style.height.px]="getTaskDuration(task.duration)">
  
  <div class="task-icon">
    <i [class]="getTaskIcon(task.type)"></i>
  </div>
  
  <div class="task-content">
    <h4 class="task-title">{{ task.title }}</h4>
    <p class="task-meta">{{ task.location }} · {{ task.duration }}</p>
    <span class="task-badge" [ngClass]="task.status">{{ task.status }}</span>
  </div>
</div>
```

### 3. DETALLE DE CULTIVO

**Características:**
- Timeline de crecimiento (Siembra → Germinación → Crecimiento → Floración → Cosecha)
- Tarjeta de recomendaciones de riego
- Lista de tareas (Pendientes/Realizadas/Aplazadas)
- Sidebar con datos del cultivo
- Historial de eventos
- Previsión meteorológica

**Timeline de Crecimiento:**
```html
<div class="growth-timeline">
  <div class="timeline-header">
    <h3>Ciclo del cultivo · Semana {{ currentWeek }} de {{ totalWeeks }}</h3>
    <span class="growth-badge">{{ currentStage }}</span>
  </div>

  <div class="timeline-track">
    <div class="timeline-progress" [style.width.%]="progressPercentage"></div>
    
    <div class="timeline-stages">
      <div class="stage" 
           *ngFor="let stage of stages"
           [ngClass]="{'completed': stage.completed, 'current': stage.current}">
        <div class="stage-icon">
          <i [class]="stage.icon"></i>
        </div>
        <span class="stage-label">{{ stage.name }}</span>
        <span class="stage-date">{{ stage.date }}</span>
      </div>
    </div>
  </div>
</div>
```

**Tarjeta de Recomendación de Riego:**
```html
<div class="irrigation-card">
  <div class="card-icon">
    <i class="icon-water"></i>
  </div>
  
  <div class="card-content">
    <h4>Recomendación de riego</h4>
    <p class="irrigation-instruction">
      Regar cada <strong>{{ days }} días</strong>. 
      Lluvia prevista el {{ rainDate }} → reducir frecuencia.
    </p>
    <p class="irrigation-schedule">
      Próximo riego recomendado: <strong>{{ nextIrrigationDate }}</strong>
    </p>
    <p class="irrigation-meta">
      Estado fenológico: {{ phenologicalState }} ({{ growthPercentage }}% del ciclo) · 
      Open-Meteo · Hace {{ hoursAgo }} h
    </p>
  </div>
</div>
```

### 4. VISTA DE PARCELA (Mapa de Zonas)

**Características:**
- Mapa visual dividido en zonas
- Cada zona muestra el cultivo actual y progreso
- Vista de parcela completa (6m x 4m típico)
- Sidebar con datos de la parcela
- Lista de cultivos activos
- Próximas tareas
- Historial reciente

**Mapa de Zonas:**
```html
<div class="parcela-map" [style.aspect-ratio]="aspectRatio">
  <div class="map-grid" [style.grid-template-columns]="gridColumns">
    
    <div class="zone-card" 
         *ngFor="let zone of zones"
         [ngClass]="{'active': zone.hasActiveCrop, 'empty': !zone.hasActiveCrop}"
         (click)="selectZone(zone)">
      
      <div class="zone-header">
        <span class="zone-name">Zona {{ zone.number }}</span>
        <span class="zone-indicator" [style.background-color]="getCropColor(zone.crop)"></span>
      </div>

      <div class="zone-content" *ngIf="zone.hasActiveCrop">
        <div class="crop-icon">
          <i [class]="getCropIcon(zone.crop)"></i>
        </div>
        <h4 class="crop-name">{{ zone.crop.name }}</h4>
        <p class="crop-progress">{{ zone.crop.progress }}% del ciclo</p>
      </div>

      <div class="zone-content empty-state" *ngIf="!zone.hasActiveCrop">
        <p>Sin cultivo</p>
      </div>
    </div>
  </div>

  <!-- Nota al pie -->
  <div class="map-footer">
    <i class="icon-info"></i>
    <span>{{ zones.length }} m · Haz clic en una zona para ver el detalle del cultivo</span>
  </div>
</div>
```

### 5. LISTA DE TAREAS

**Características:**
- Estadísticas superiores (Pendientes hoy / Completadas semana / Aplazadas / Total mes)
- Filtros por estado (Todas/Pendientes/Realizadas/Aplazadas)
- Filtros por tipo (Riego/Fitosanitario/Abonado/Cosecha)
- Búsqueda
- Ordenación
- Items con checkbox, título, cultivo/parcela, fecha, tipo (badge)

**Componente de Lista:**
```html
<div class="tareas-container">
  <!-- Estadísticas superiores -->
  <div class="task-stats">
    <div class="stat-card urgent">
      <div class="stat-icon">⚠️</div>
      <div class="stat-content">
        <span class="stat-value">{{ pendingToday }}</span>
        <span class="stat-label">Pendientes hoy</span>
      </div>
    </div>

    <div class="stat-card success">
      <div class="stat-icon">✓</div>
      <div class="stat-content">
        <span class="stat-value">{{ completedWeek }}</span>
        <span class="stat-label">Completadas esta semana</span>
      </div>
    </div>

    <div class="stat-card warning">
      <div class="stat-icon">⏸</div>
      <div class="stat-content">
        <span class="stat-value">{{ postponed }}</span>
        <span class="stat-label">Aplazadas</span>
      </div>
    </div>

    <div class="stat-card info">
      <div class="stat-icon">📅</div>
      <div class="stat-content">
        <span class="stat-value">{{ totalMonth }}</span>
        <span class="stat-label">Total este mes</span>
      </div>
    </div>
  </div>

  <!-- Filtros -->
  <div class="task-filters">
    <div class="filter-group">
      <button class="filter-btn" 
              *ngFor="let status of statusFilters"
              [ngClass]="{'active': status.active}"
              (click)="toggleFilter(status)">
        {{ status.label }}
      </button>
    </div>

    <div class="filter-group">
      <button class="filter-btn type-filter" 
              *ngFor="let type of typeFilters"
              [ngClass]="{'active': type.active}"
              (click)="toggleTypeFilter(type)">
        <i [class]="type.icon"></i>
        {{ type.label }}
      </button>
    </div>

    <div class="search-box">
      <i class="icon-search"></i>
      <input type="text" 
             placeholder="Buscar tareas..." 
             [(ngModel)]="searchTerm"
             (input)="onSearch()">
    </div>

    <select class="sort-select" [(ngModel)]="sortBy" (change)="onSort()">
      <option value="date">Ordenar por: Fecha ↓</option>
      <option value="priority">Ordenar por: Prioridad</option>
      <option value="type">Ordenar por: Tipo</option>
    </select>
  </div>

  <!-- Lista de tareas -->
  <div class="task-list">
    <table class="tasks-table">
      <thead>
        <tr>
          <th width="40"></th>
          <th>TAREA</th>
          <th>CULTIVO / PARCELA</th>
          <th>FECHA</th>
          <th>TIPO</th>
          <th width="100"></th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let task of filteredTasks" 
            [ngClass]="{'completed': task.completed, 'urgent': task.isUrgent}">
          
          <td>
            <input type="checkbox" 
                   [checked]="task.completed"
                   (change)="toggleTaskComplete(task)">
          </td>

          <td class="task-title-cell">
            <div class="task-icon">
              <i [class]="getTaskIcon(task.type)"></i>
            </div>
            <div class="task-info">
              <h4>{{ task.title }}</h4>
              <p class="task-description">{{ task.description }}</p>
            </div>
          </td>

          <td class="crop-cell">
            <div class="crop-indicator" [style.background-color]="getCropColor(task.crop)"></div>
            <span>{{ task.crop }} · {{ task.parcela }}</span>
          </td>

          <td class="date-cell" [ngClass]="{'urgent': task.isToday}">
            {{ task.date | date:'dd MMM' }}
          </td>

          <td>
            <span class="task-type-badge" [ngClass]="task.type">
              {{ task.typeLabel }}
            </span>
          </td>

          <td class="actions-cell">
            <button class="btn-icon" (click)="completeTask(task)">
              <i class="icon-check"></i>
            </button>
            <button class="btn-icon" (click)="postponeTask(task)">
              <i class="icon-clock"></i>
            </button>
            <button class="btn-icon" (click)="openTaskMenu(task)">
              <i class="icon-more"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

---

## IMPLEMENTACIÓN DE TEMA CLARO/OSCURO

### Theme Service (theme.service.ts)
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'huerta-digital-theme';
  private themeSubject: BehaviorSubject<Theme>;
  public theme$: Observable<Theme>;

  constructor() {
    const savedTheme = this.getSavedTheme();
    this.themeSubject = new BehaviorSubject<Theme>(savedTheme);
    this.theme$ = this.themeSubject.asObservable();
    this.applyTheme(savedTheme);
  }

  private getSavedTheme(): Theme {
    const saved = localStorage.getItem(this.THEME_KEY) as Theme;
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    
    // Detectar preferencia del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  public toggleTheme(): void {
    const newTheme: Theme = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  public setTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    this.applyTheme(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  public getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
  }
}
```

### Estilos de Tema (_themes.scss)
```scss
// Variables por tema
:root[data-theme='dark'] {
  // Colores base
  --bg-primary: #0a1f1a;
  --bg-secondary: #1a2e28;
  --bg-card: #1a3329;
  --bg-surface: #2a4a3f;
  --bg-hover: #2a4a3f;
  
  // Verde principal
  --primary: #4ade80;
  --primary-hover: #22c55e;
  --primary-active: #16a34a;
  
  // Texto
  --text-primary: #f0fdf4;
  --text-secondary: #86efac;
  --text-muted: #6b7280;
  
  // Bordes
  --border-color: #2a4a3f;
  --border-color-light: #1a3329;
  
  // Sombras
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
  
  // Estados
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
}

:root[data-theme='light'] {
  // Colores base
  --bg-primary: #f9fafb;
  --bg-secondary: #d1f4e0;
  --bg-card: #ffffff;
  --bg-surface: #f3f4f6;
  --bg-hover: #e5e7eb;
  
  // Verde principal
  --primary: #16a34a;
  --primary-hover: #15803d;
  --primary-active: #14532d;
  
  // Texto
  --text-primary: #111827;
  --text-secondary: #16a34a;
  --text-muted: #6b7280;
  
  // Bordes
  --border-color: #e5e7eb;
  --border-color-light: #f3f4f6;
  
  // Sombras
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  // Estados
  --success: #16a34a;
  --warning: #ea580c;
  --error: #dc2626;
  --info: #2563eb;
}

// Los colores de tareas son consistentes en ambos temas
:root {
  --color-riego: #3b82f6;
  --color-cosecha: #ef4444;
  --color-poda: #f59e0b;
  --color-abonado: #78350f;
  --color-tratamiento: #a855f7;
  --color-inspeccion: #dc2626;
}
```

### Toggle Component
```typescript
@Component({
  selector: 'app-theme-toggle',
  template: `
    <button class="theme-toggle" 
            (click)="toggle()"
            [attr.aria-label]="'Cambiar a tema ' + (isDark ? 'claro' : 'oscuro')">
      <i class="icon" [ngClass]="isDark ? 'icon-sun' : 'icon-moon'"></i>
    </button>
  `,
  styles: [`
    .theme-toggle {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--bg-card);
      color: var(--text-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover {
        background: var(--bg-hover);
        border-color: var(--primary);
      }

      .icon {
        font-size: 20px;
      }
    }
  `]
})
export class ThemeToggleComponent {
  isDark = false;

  constructor(private themeService: ThemeService) {
    this.themeService.theme$.subscribe(theme => {
      this.isDark = theme === 'dark';
    });
  }

  toggle() {
    this.themeService.toggleTheme();
  }
}
```

---

## COMPONENTES REUTILIZABLES

### Stat Card
```typescript
@Component({
  selector: 'app-stat-card',
  template: `
    <div class="stat-card" [ngClass]="variant">
      <div class="stat-icon">
        <i [class]="icon"></i>
      </div>
      <div class="stat-content">
        <span class="stat-value">{{ value }}</span>
        <span class="stat-label">{{ label }}</span>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: var(--bg-card);
      border-radius: 12px;
      border: 1px solid var(--border-color);
      
      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }
      
      .stat-content {
        display: flex;
        flex-direction: column;
        
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }
        
        .stat-label {
          font-size: 14px;
          color: var(--text-muted);
          margin-top: 4px;
        }
      }
      
      &.urgent .stat-icon {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }
      
      &.success .stat-icon {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
      }
      
      &.warning .stat-icon {
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
      }
      
      &.info .stat-icon {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
      }
    }
  `]
})
export class StatCardComponent {
  @Input() icon: string = '';
  @Input() value: string | number = '';
  @Input() label: string = '';
  @Input() variant: 'urgent' | 'success' | 'warning' | 'info' = 'info';
}
```

### Progress Bar
```typescript
@Component({
  selector: 'app-progress-bar',
  template: `
    <div class="progress-bar">
      <div class="progress-label">
        <span>{{ label }}</span>
        <span class="progress-value">{{ value }}%</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" 
             [style.width.%]="value"
             [ngClass]="getColorClass()"></div>
      </div>
    </div>
  `,
  styles: [`
    .progress-bar {
      .progress-label {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
        color: var(--text-secondary);
        
        .progress-value {
          font-weight: 600;
          color: var(--text-primary);
        }
      }
      
      .progress-track {
        height: 8px;
        background: var(--bg-surface);
        border-radius: 4px;
        overflow: hidden;
        
        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
          
          &.success { background: var(--color-riego); }
          &.warning { background: var(--color-poda); }
          &.danger { background: var(--color-cosecha); }
        }
      }
    }
  `]
})
export class ProgressBarComponent {
  @Input() label: string = '';
  @Input() value: number = 0;
  @Input() threshold: { warning: number; danger: number } = { warning: 50, danger: 25 };

  getColorClass(): string {
    if (this.value <= this.threshold.danger) return 'danger';
    if (this.value <= this.threshold.warning) return 'warning';
    return 'success';
  }
}
```

---

## PIPES PERSONALIZADOS

### Task Type Icon Pipe
```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'taskTypeIcon'
})
export class TaskTypeIconPipe implements PipeTransform {
  private iconMap: { [key: string]: string } = {
    'riego': 'icon-droplet',
    'cosecha': 'icon-harvest',
    'poda': 'icon-scissors',
    'abonado': 'icon-leaf',
    'tratamiento': 'icon-spray',
    'inspeccion': 'icon-eye',
    'siembra': 'icon-seed',
    'transplante': 'icon-plant'
  };

  transform(taskType: string): string {
    return this.iconMap[taskType] || 'icon-check';
  }
}
```

### Task Color Pipe
```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'taskColor'
})
export class TaskColorPipe implements PipeTransform {
  private colorMap: { [key: string]: string } = {
    'riego': 'var(--color-riego)',
    'cosecha': 'var(--color-cosecha)',
    'poda': 'var(--color-poda)',
    'abonado': 'var(--color-abonado)',
    'tratamiento': 'var(--color-tratamiento)',
    'inspeccion': 'var(--color-inspeccion)'
  };

  transform(taskType: string): string {
    return this.colorMap[taskType] || 'var(--primary)';
  }
}
```

---

## DIRECTRICES DE IMPLEMENTACIÓN

### 1. Prioridades de Desarrollo
1. **Fase 1:** Estructura base y sistema de temas
   - Configurar variables CSS y temas
   - Implementar ThemeService
   - Crear layout base (sidebar + header + main)

2. **Fase 2:** Componentes compartidos
   - Stat cards
   - Progress bars
   - Task badges
   - Empty states

3. **Fase 3:** Vistas principales
   - Dashboard
   - Lista de tareas
   - Calendario
   - Lista de parcelas/cultivos

4. **Fase 4:** Vistas de detalle
   - Detalle de cultivo
   - Detalle de parcela
   - Formularios

### 2. Mejores Prácticas
- **Componentes pequeños y reutilizables:** Cada componente debe tener una única responsabilidad
- **Usar variables CSS:** Todas las propiedades de estilo deben usar variables para soportar temas
- **Responsive design:** Mobile-first, usar grid y flexbox
- **Accesibilidad:** ARIA labels, keyboard navigation, contraste adecuado
- **Performance:** OnPush change detection, lazy loading de módulos

### 3. Animaciones y Transiciones
```scss
// Transiciones suaves
.card, .button, .input {
  transition: all 0.2s ease-in-out;
}

// Hover states
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

// Animación de aparición
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}
```

### 4. Iconografía
Usar una librería de iconos consistente como:
- **Lucide Icons** (recomendado por consistencia con diseño)
- **Material Icons**
- **Font Awesome**

Iconos específicos necesarios:
- `icon-droplet` (riego)
- `icon-harvest` (cosecha)
- `icon-scissors` (poda)
- `icon-leaf` (abonado)
- `icon-spray` (tratamiento)
- `icon-plant` (cultivo)
- `icon-grid` (parcela)
- `icon-calendar` (calendario)
- `icon-check` (tarea completada)
- `icon-sun` / `icon-moon` (tema)

---

## CHECKLIST DE IMPLEMENTACIÓN

### Setup Inicial
- [ ] Instalar dependencias (Angular Material opcional, iconos)
- [ ] Configurar variables de tema en `_variables.scss` y `_themes.scss`
- [ ] Crear ThemeService y ThemeToggle component
- [ ] Configurar layout base (sidebar, header, main content area)

### Componentes Compartidos
- [ ] StatCard component
- [ ] ProgressBar component
- [ ] TaskBadge component
- [ ] EmptyState component
- [ ] WeatherWidget component
- [ ] Pipes: TaskTypeIcon, TaskColor

### Vistas Principales
- [ ] Dashboard
- [ ] Calendario (week view)
- [ ] Lista de tareas con filtros
- [ ] Lista de cultivos
- [ ] Lista de parcelas

### Vistas de Detalle
- [ ] Detalle de cultivo (con timeline y tareas)
- [ ] Detalle de parcela (con mapa de zonas)
- [ ] Formularios (crear/editar cultivo, parcela, tarea)

### Responsive & Testing
- [ ] Verificar responsive en móvil/tablet
- [ ] Testing de tema claro/oscuro
- [ ] Verificar accesibilidad (contraste, navegación)
- [ ] Performance (lazy loading, change detection)

---

## EJEMPLO DE PROMPT PARA OPENCODE

Puedes copiar y pegar este prompt directamente:

```
Necesito mejorar el frontend de mi aplicación Angular "Huerta Digital" basándome en wireframes profesionales.

CONTEXTO:
- Framework: Angular (versión actual)
- Estado: Tengo código existente pero quiero refactorizar completamente el diseño
- Características: Sistema de gestión de huerta con calendario, cultivos, parcelas y tareas

OBJETIVO PRINCIPAL:
Implementar un sistema de diseño completo con tema claro/oscuro inspirado en los wireframes proporcionados.

SISTEMA DE COLORES:
Tema Oscuro:
- Fondo principal: #0a1f1a
- Fondo secundario/sidebar: #1a2e28
- Fondo tarjetas: #1a3329
- Verde principal: #4ade80
- Texto principal: #f0fdf4
- Texto secundario: #86efac

Tema Claro:
- Fondo principal: #f9fafb
- Fondo secundario/sidebar: #d1f4e0
- Fondo tarjetas: #ffffff
- Verde principal: #16a34a
- Texto principal: #111827

Colores por tipo de tarea (consistentes en ambos temas):
- Riego: #3b82f6 (azul)
- Cosecha: #ef4444 (rojo)
- Poda: #f59e0b (amarillo/naranja)
- Abonado: #78350f (marrón)
- Tratamiento: #a855f7 (morado)

COMPONENTES PRIORITARIOS A IMPLEMENTAR:

1. ThemeService para gestión de temas con persistencia en localStorage

2. Sidebar de navegación:
   - Fondo verde según tema
   - Logo + nombre app
   - Info de huerta activa
   - Menú con iconos (Dashboard, Calendario, Cultivos, Parcelas, Tareas)
   - Usuario en parte inferior
   - Ancho fijo: 240px

3. Vista de Calendario (week view):
   - Header con selector de vista
   - Grid de 7 columnas (días de semana)
   - Eventos de tareas con colores según tipo
   - Sidebar derecho con calendario mensual y estadísticas

4. Vista de Detalle de Cultivo:
   - Timeline horizontal mostrando fases: Siembra → Germinación → Crecimiento → Floración → Cosecha
   - Tarjeta destacada con recomendaciones de riego
   - Lista de tareas (tabs: Pendientes/Realizadas/Aplazadas)
   - Sidebar con datos del cultivo y próximas tareas

5. Vista de Parcela (mapa de zonas):
   - Grid visual mostrando zonas de la parcela
   - Cada zona muestra cultivo activo y % de progreso
   - Diferentes colores según tipo de cultivo
   - Click en zona para ver detalle

6. Lista de Tareas:
   - Tarjetas de estadísticas superiores (pendientes hoy, completadas, aplazadas, total mes)
   - Filtros por estado y tipo de tarea
   - Búsqueda y ordenación
   - Tabla con checkbox, título, cultivo/parcela, fecha, tipo (badge), acciones

COMPONENTES REUTILIZABLES:
- StatCard: tarjeta de estadística con icono, valor y label
- ProgressBar: barra de progreso con label y porcentaje
- TaskBadge: badge con color según tipo de tarea
- ThemeToggle: botón para cambiar tema

DIRECTRICES:
- Usar variables CSS para todos los colores y propiedades de tema
- Implementar :root[data-theme='dark'] y :root[data-theme='light']
- Componentes pequeños y reutilizables
- Mobile-first responsive design
- Transiciones suaves (0.2s ease)
- Accesibilidad (ARIA labels, keyboard nav)

Por favor, genera:
1. ThemeService con gestión completa de temas
2. Estructura de variables CSS (_variables.scss y _themes.scss)
3. [Componente específico que necesites]

¿Por dónde empezamos?
```

---

## NOTAS FINALES

Este prompt está diseñado para ser utilizado de forma iterativa. Puedes:

1. **Empezar por el setup base:** Pide primero el ThemeService y las variables CSS
2. **Ir componente por componente:** Solicita cada componente individual con su prompt específico
3. **Refinar sobre la marcha:** Pide ajustes de estilos, colores o funcionalidad según vayas probando

**Ejemplo de uso iterativo:**
```
"Basándote en el prompt de Huerta Digital, genera el ThemeService completo con:
- Gestión de tema claro/oscuro
- Persistencia en localStorage
- Detección de preferencia del sistema
- Observable para subscribirse a cambios"
```

Luego:
```
"Ahora genera el componente Sidebar con:
- Estructura HTML completa
- Estilos usando variables CSS del tema
- Navegación con routerLink
- Sección de huerta activa
- Usuario en parte inferior"
```

¡Éxito con tu proyecto! 🌱
