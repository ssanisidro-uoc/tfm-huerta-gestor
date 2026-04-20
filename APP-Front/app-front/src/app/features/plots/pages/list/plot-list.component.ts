import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PlotService } from '../../services/plot.service';
import { TranslatePipe } from '../../../../core/services/i18n/translate.pipe';

@Component({
  selector: 'app-plot-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './plot-list.component.html',
  styleUrl: './plot-list.component.scss'
})
export class PlotListComponent implements OnInit {
  gardenId = '';

  constructor(
    private route: ActivatedRoute,
    public plotService: PlotService
  ) {}

  ngOnInit(): void {
    this.gardenId = this.route.snapshot.paramMap.get('gardenId') || '';
    if (this.gardenId) {
      this.plotService.getPlotsByGarden(this.gardenId);
    }
  }
}
