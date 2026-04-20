import { Component, inject, signal, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LunarService, TaskRecommendation, TaskRecommendationStats } from '../../../core/services/lunar.service';

@Component({
  selector: 'app-lunar-task-response',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <div class="lunar-response loading">
        <span>🌙</span>
      </div>
    } @else if (recommendations().length > 0) {
      <div class="lunar-response">
        <div class="response-header">
          <span class="icon">🌙</span>
          <span class="title">Recomendación Lunar</span>
        </div>
        
        @for (rec of recommendations(); track rec.id) {
          <div class="recommendation-card" [class]="getRecClass(rec.recommendation_type)">
            @if (rec.recommendation_title) {
              <span class="rec-title">{{ rec.recommendation_title }}</span>
            }
            @if (rec.recommendation_summary) {
              <span class="rec-summary">{{ rec.recommendation_summary }}</span>
            }
            
            @if (rec.is_shown_to_user && !rec.user_response) {
              <div class="response-buttons">
                <button class="btn-followed" (click)="onResponse(rec.id, 'followed')">
                  ✅ Lo seguí
                </button>
                <button class="btn-ignored" (click)="onResponse(rec.id, 'ignored')">
                  ❌ Lo ignoré
                </button>
                <button class="btn-dismissed" (click)="onResponse(rec.id, 'dismissed')">
                  ✋ No mostrado
                </button>
              </div>
            }
            
            @if (rec.user_response) {
              <div class="user-response">
                @switch (rec.user_response) {
                  @case ('followed') {
                    <span class="response-badge followed">✅ Seguido</span>
                  }
                  @case ('ignored') {
                    <span class="response-badge ignored">❌ Ignorado</span>
                  }
                  @case ('postponed') {
                    <span class="response-badge postponed">⏰ Aplazado</span>
                  }
                  @case ('dismissed') {
                    <span class="response-badge dismissed">✋ Descartado</span>
                  }
                }
                @if (rec.user_notes) {
                  <span class="notes">{{ rec.user_notes }}</span>
                }
              </div>
            }
          </div>
        }
        
        @if (stats()) {
          <div class="stats">
            <span class="stat">Mostradas: {{ stats()!.shown }}/{{ stats()!.total }}</span>
            <span class="stat">Seguidas: {{ stats()!.followed }}</span>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .lunar-response {
      background: var(--surface-card);
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;
      border: 1px solid var(--border-color);
    }
    .lunar-response.loading {
      display: flex;
      justify-content: center;
      padding: 20px;
      opacity: 0.5;
    }
    .response-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    .response-header .icon {
      font-size: 20px;
    }
    .response-header .title {
      font-weight: 600;
      color: var(--text-primary);
    }
    .recommendation-card {
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 10px;
    }
    .recommendation-card.highly_favorable {
      background: #dcfce7;
      border-left: 3px solid #22c55e;
    }
    .recommendation-card.favorable {
      background: #dbeafe;
      border-left: 3px solid #3b82f6;
    }
    .recommendation-card.neutral {
      background: var(--surface-hover);
      border-left: 3px solid #9ca3af;
    }
    .recommendation-card.unfavorable {
      background: #fee2e2;
      border-left: 3px solid #ef4444;
    }
    .rec-title {
      display: block;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .rec-summary {
      display: block;
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 10px;
    }
    .response-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .response-buttons button {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: opacity 0.2s;
    }
    .response-buttons button:hover {
      opacity: 0.8;
    }
    .btn-followed { background: #22c55e; color: white; }
    .btn-ignored { background: #ef4444; color: white; }
    .btn-dismissed { background: #9ca3af; color: white; }
    .user-response {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
    }
    .response-badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .response-badge.followed { background: #dcfce7; color: #166534; }
    .response-badge.ignored { background: #fee2e2; color: #991b1b; }
    .response-badge.postponed { background: #fef3c7; color: #92400e; }
    .response-badge.dismissed { background: #f3f4f6; color: #4b5563; }
    .notes {
      font-size: 12px;
      color: var(--text-muted);
    }
    .stats {
      display: flex;
      gap: 16px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--border-color);
      font-size: 12px;
      color: var(--text-muted);
    }
  `]
})
export class LunarTaskResponseComponent implements OnInit {
  @Input() taskId!: string;
  
  private lunarService = inject(LunarService);
  
  recommendations = signal<TaskRecommendation[]>([]);
  stats = signal<TaskRecommendationStats | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.loadRecommendations();
  }

  loadRecommendations(): void {
    this.loading.set(true);
    
    this.lunarService.getTaskRecommendations(this.taskId).subscribe({
      next: (response) => {
        if (response.success) {
          this.recommendations.set(response.data);
        }
      },
      complete: () => {
        this.loading.set(false);
        this.loadStats();
      }
    });
  }

  loadStats(): void {
    this.lunarService.getTaskRecommendationStats(this.taskId).subscribe({
      next: (response) => {
        if (response.success) {
          this.stats.set(response.data);
        }
      }
    });
  }

  onResponse(recommendationId: string, response: string): void {
    this.lunarService.updateRecommendationResponse(recommendationId, response).subscribe({
      next: () => {
        this.loadRecommendations();
      }
    });
  }

  getRecClass(type: string): string {
    const map: Record<string, string> = {
      'highly_favorable': 'highly_favorable',
      'highly_recommended': 'highly_favorable',
      'favorable': 'favorable',
      'recommended': 'favorable',
      'neutral': 'neutral',
      'unfavorable': 'unfavorable',
      'not_recommended': 'unfavorable',
      'avoid': 'unfavorable'
    };
    return map[type] || 'neutral';
  }
}