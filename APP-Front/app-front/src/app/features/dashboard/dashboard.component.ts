import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GardenService } from '../gardens/services/garden.service';
import { CalendarService, Task } from '../../core/services/calendar.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

interface StatusCard {
  title: string;
  value: string | number;
  status: 'success' | 'warning' | 'error' | 'neutral';
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BadgeComponent],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <div class="header-text">
          <h1>Bienvenido de nuevo</h1>
          <p>Resumen del estado de tus huertas</p>
        </div>
      </div>

      <!-- Status Cards (Overview first) -->
      <section class="status-section">
        <h2 class="section-title">Estado de Huertas</h2>
        <div class="status-cards">
          @for (card of statusCards(); track card.title) {
            <div class="status-card" [class]="'status-card-' + card.status">
              <div class="status-indicator"></div>
              <div class="status-content">
                <span class="status-value">{{ card.value }}</span>
                <span class="status-label">{{ card.title }}</span>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Overview Stats Grid -->
      <section class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon gardens">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22c4-4 8-7.5 8-12a8 8 0 1 0-16 0c0 4.5 4 8 8 12z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ gardenService.gardens().length }}</span>
              <span class="stat-label">Huertas Activas</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon tasks">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ pendingTasks().length }}</span>
              <span class="stat-label">Tareas Pendientes</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon harvest">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ upcomingHarvests().length }}</span>
              <span class="stat-label">Cosechas Próximas</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon alerts">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ overdueTasks().length }}</span>
              <span class="stat-label">Tareas Atrasadas</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="content">
        <h2 class="section-title">Accesos Rápidos</h2>
        <div class="content-grid">
          <a routerLink="/gardens" class="card-link">
            <div class="card">
              <div class="card-icon gardens">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22c4-4 8-7.5 8-12a8 8 0 1 0-16 0c0 4.5 4 8 8 12z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h2>Mis Huertas</h2>
              <p>Gestiona tus huertas y parcelas</p>
            </div>
          </a>
          
          <a routerLink="/gardens/shared" class="card-link">
            <div class="card">
              <div class="card-icon shared">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h2>Huertas Compartidas</h2>
              <p>Huertas que otros comparten contigo</p>
            </div>
          </a>
          
          <a routerLink="/calendar" class="card-link">
            <div class="card">
              <div class="card-icon calendar">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h2>Calendario de Tareas</h2>
              <p>Planifica y gestiona tus tareas agrícolas</p>
            </div>
          </a>
          
          <a routerLink="/crops" class="card-link">
            <div class="card">
              <div class="card-icon crops">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11h10"></path>
                </svg>
              </div>
              <h2>Catálogo de Cultivos</h2>
              <p>Explora y gestiona tus cultivos</p>
            </div>
          </a>
        </div>
      </section>

      <!-- Próximas Tareas -->
      @if (pendingTasks().length > 0) {
        <section class="tasks-section">
          <div class="section-header">
            <h2 class="section-title">Próximas Tareas</h2>
            <a routerLink="/calendar" class="view-all">Ver todas</a>
          </div>
          <div class="tasks-list">
            @for (task of pendingTasks().slice(0, 5); track task.id) {
              <div class="task-item">
                <span class="task-type" [class]="'task-type-' + task.type">
                  {{ getTypeLabel(task.type) }}
                </span>
                <span class="task-title">{{ task.title }}</span>
                <span class="task-date">{{ task.date | date:'shortDate':'es-ES' }}</span>
              </div>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 0;
    }

    .dashboard-header {
      margin-bottom: 1.5rem;

      .header-text {
        h1 {
          font-size: 1.75rem;
          margin-bottom: 0.25rem;
        }

        p {
          color: var(--text-secondary);
          font-size: 1rem;
          margin: 0;
        }
      }
    }

    .section-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 1rem;
    }

    /* Status Cards */
    .status-section {
      margin-bottom: 1.5rem;
    }

    .status-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .status-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;

      .status-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }

      &.status-card-success .status-indicator {
        background: var(--color-primary);
      }

      &.status-card-warning .status-indicator {
        background: var(--color-accent);
      }

      &.status-card-error .status-indicator {
        background: var(--color-error);
      }

      &.status-card-neutral .status-indicator {
        background: var(--text-muted);
      }

      .status-content {
        display: flex;
        flex-direction: column;
      }

      .status-value {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .status-label {
        font-size: 0.8rem;
        color: var(--text-secondary);
      }
    }

    /* Stats Grid */
    .stats-section {
      margin-bottom: 1.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;

        &.gardens {
          background: rgba(46, 125, 50, 0.15);
          color: var(--color-primary);
        }

        &.tasks {
          background: rgba(33, 150, 243, 0.15);
          color: #2196f3;
        }

        &.harvest {
          background: rgba(255, 152, 0, 0.15);
          color: #ff9800;
        }

        &.alerts {
          background: rgba(198, 40, 40, 0.15);
          color: #c62828;
        }
      }

      .stat-info {
        display: flex;
        flex-direction: column;
      }

      .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .stat-label {
        font-size: 0.8rem;
        color: var(--text-secondary);
      }
    }

    /* Content Grid */
    .content {
      margin-bottom: 1.5rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .card-link {
      text-decoration: none;
      display: block;

      &:hover .card {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: var(--shadow);
      transition: all 0.2s ease;
      height: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      h2 {
        margin: 0;
        font-size: 1rem;
        color: var(--text-primary);
      }

      p {
        margin: 0;
        font-size: 0.8rem;
        color: var(--text-secondary);
      }
    }

    .card-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.gardens { background: rgba(46, 125, 50, 0.15); color: var(--color-primary); }
      &.shared { background: rgba(33, 150, 243, 0.15); color: #2196F3; }
      &.calendar { background: rgba(255, 152, 0, 0.15); color: #FF9800; }
      &.crops { background: rgba(156, 39, 176, 0.15); color: #9C27B0; }
    }

    /* Tasks Section */
    .tasks-section {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.25rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;

      .view-all {
        font-size: 0.875rem;
        color: var(--color-primary);
      }
    }

    .tasks-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .task-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--bg-primary);
      border-radius: 6px;

      .task-type {
        font-size: 0.7rem;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-weight: 500;

        &.task-type-planting { background: rgba(46, 125, 50, 0.15); color: #2e7d32; }
        &.task-type-harvest { background: rgba(245, 124, 0, 0.15); color: #f57c00; }
        &.task-type-irrigation { background: rgba(33, 150, 243, 0.15); color: #2196f3; }
        &.task-type-fertilizing { background: rgba(156, 39, 176, 0.15); color: #9c27b0; }
      }

      .task-title {
        flex: 1;
        font-size: 0.875rem;
        color: var(--text-primary);
      }

      .task-date {
        font-size: 0.75rem;
        color: var(--text-muted);
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  gardenService: GardenService = inject(GardenService);
  calendarService: CalendarService = inject(CalendarService);

  statusCards = signal<StatusCard[]>([
    { title: 'Huertas al día', value: 0, status: 'success', icon: 'check' },
    { title: 'Tareas pendientes', value: 0, status: 'warning', icon: 'clock' },
    { title: 'Sin cultivo', value: 0, status: 'neutral', icon: 'empty' },
  ]);

  pendingTasks = signal<Task[]>([]);
  upcomingHarvests = signal<Task[]>([]);
  overdueTasks = signal<Task[]>([]);

  typeLabels: Record<string, string> = {
    'planting': 'Plantación',
    'harvest': 'Cosecha',
    'irrigation': 'Riego',
    'fertilizing': 'Fertilización',
    'pruning': 'Poda',
    'treatment': 'Tratamiento',
    'other': 'Otro'
  };

  ngOnInit(): void {
    this.gardenService.getGardens();
    this.calendarService.loadSampleTasks();
    
    // Calcular tareas
    const today = new Date();
    const tasks: Task[] = this.calendarService.tasks();
    
    this.pendingTasks.set(tasks.filter((t: Task) => t.status === 'pending'));
    this.upcomingHarvests.set(tasks.filter((t: Task) => 
      t.type === 'harvest' && 
      new Date(t.date) >= today &&
      new Date(t.date) <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    ));
    this.overdueTasks.set(tasks.filter((t: Task) => 
      t.status === 'pending' && 
      new Date(t.date) < today
    ));

    // Actualizar status cards
    this.statusCards.set([
      { title: 'Huertas al día', value: this.gardenService.gardens().length, status: 'success', icon: 'check' },
      { title: 'Tareas pendientes', value: this.pendingTasks().length, status: 'warning', icon: 'clock' },
      { title: 'Tareas atrasadas', value: this.overdueTasks().length, status: this.overdueTasks().length > 0 ? 'error' : 'neutral', icon: 'alert' },
    ]);
  }

  getTypeLabel(type: string): string {
    return this.typeLabels[type] || type;
  }
}