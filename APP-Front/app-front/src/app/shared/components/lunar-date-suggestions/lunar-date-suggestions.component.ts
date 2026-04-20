import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LunarService, TodayLunarData, LunarRecommendation } from '../../../core/services/lunar.service';

@Component({
  selector: 'app-lunar-date-suggestions',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <div class="lunar-suggestions loading">
        <span class="spinner">🌙</span>
        <span>Cargando...</span>
      </div>
    } @else if (recommendations().length > 0) {
      <div class="lunar-suggestions">
        <div class="suggestion-header">
          <span class="icon">⭐</span>
          <span class="title">Mejor según la luna:</span>
        </div>
        <div class="suggestion-items">
          @for (rec of recommendations().slice(0, 3); track rec.id) {
            <span class="suggestion-tag" [class]="getRecClass(rec.recommendationType)">
              {{ getActionLabel(rec.agriculturalAction) }}
            </span>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .lunar-suggestions {
      background: var(--surface-hover);
      border-radius: 8px;
      padding: 12px;
      margin-top: 8px;
      border-left: 3px solid #3b82f6;
    }
    .lunar-suggestions.loading {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-muted);
      font-size: 13px;
    }
    .suggestion-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
    }
    .suggestion-header .icon {
      font-size: 16px;
    }
    .suggestion-header .title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }
    .suggestion-items {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .suggestion-tag {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .suggestion-tag.highly_recommended { background: #dcfce7; color: #166534; }
    .suggestion-tag.recommended { background: #dbeafe; color: #1e40af; }
    .spinner {
      animation: spin 1s linear infinite;
    }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `]
})
export class LunarDateSuggestionsComponent implements OnInit {
  private lunarService = inject(LunarService);
  
  recommendations = signal<LunarRecommendation[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadRecommendations('sowing');
  }

  loadRecommendations(taskType: string): void {
    this.loading.set(true);
    this.lunarService.getRecommendations(taskType).subscribe({
      next: (response) => {
        if (response.success) {
          this.recommendations.set(response.data);
        }
      },
      complete: () => this.loading.set(false)
    });
  }

  getRecClass(type: string): string {
    if (type === 'highly_recommended') return 'highly_recommended';
    if (type === 'recommended') return 'recommended';
    return 'not_recommended';
  }

  getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      'sowing': 'Siembra',
      'harvesting': 'Cosecha',
      'transplanting': 'Trasplante',
      'pruning': 'Poda',
      'weeding': 'Desmalezar',
      'fertilizing': 'Fertilizar',
      'composting': 'Compostar'
    };
    return labels[action] || action;
  }
}