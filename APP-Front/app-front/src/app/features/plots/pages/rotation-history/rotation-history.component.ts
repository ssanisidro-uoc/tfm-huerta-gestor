import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PlotService } from '../../services/plot.service';
import { TranslatePipe } from '../../../../core/services/i18n/translate.pipe';

interface RotationItem {
  year: number;
  sequence: number;
  crop_name: string;
  planting_date: string;
  harvest_date: string | null;
  yield_kg: number | null;
  rotation_score: number | null;
  status: string;
}

interface RotationHistory {
  plot_id: string;
  plot_name: string;
  garden_name: string;
  rotations: RotationItem[];
}

@Component({
  selector: 'app-rotation-history',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rotation-history.component.html',
  styleUrl: './rotation-history.component.scss'
})
export class RotationHistoryComponent implements OnInit {
  private plotService = inject(PlotService);
  private route = inject(ActivatedRoute);

  plotId = '';
  loading = signal(false);
  error = signal<string | null>(null);
  history = signal<RotationHistory | null>(null);

  ngOnInit(): void {
    this.plotId = this.route.snapshot.paramMap.get('id') || '';
    if (this.plotId) {
      this.loadHistory();
    }
  }

  loadHistory(): void {
    this.loading.set(true);
    this.error.set(null);

    this.plotService.getRotationHistory(this.plotId).subscribe((response: any) => {
      this.loading.set(false);
      if (response && response.success) {
        this.history.set(response.data);
      } else {
        this.error.set('Error al cargar el historial de rotaciones');
      }
    });
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  getScoreClass(score: number | null): string {
    if (score === null) return '';
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  }

  getUniqueYears(): number {
    const years = new Set(this.history()?.rotations?.map(r => r.year) || []);
    return years.size;
  }
}