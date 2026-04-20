import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GardenService } from '../../services/garden.service';
import { TranslationService } from '../../../../core/services/i18n/translation.service';
import { TranslatePipe } from '../../../../core/services/i18n/translate.pipe';

@Component({
  selector: 'app-garden-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './garden-list.component.html',
  styleUrl: './garden-list.component.scss'
})
export class GardenListComponent implements OnInit {
  gardenService = inject(GardenService);
  private translationService = inject(TranslationService);

  ngOnInit(): void {
    this.gardenService.getGardens().subscribe();
  }

  getClimateLabel(zone: string): string {
    const key = `gardens.climateZones.${zone}`;
    return this.translationService.t(key) || zone;
  }
}
