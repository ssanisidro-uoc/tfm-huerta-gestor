import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GardenService } from '../../services/garden.service';

@Component({
  selector: 'app-garden-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './garden-list.component.html',
  styleUrl: './garden-list.component.scss'
})
export class GardenListComponent implements OnInit {
  gardenService = inject(GardenService);

  climateLabels: Record<string, string> = {
    'mediterranean_coast': 'Costa Mediterránea',
    'mediterranean_interior': 'Interior Mediterráneo',
    'atlantic': 'Atlántico',
    'continental': 'Continental',
    'mountain': 'Montaña',
    'subtropical': 'Subtropical',
    'semiarid': 'Semiárido',
    'canary_islands': 'Islas Canarias'
  };

  ngOnInit(): void {
    this.gardenService.getGardens().subscribe();
  }

  getClimateLabel(zone: string): string {
    return this.climateLabels[zone] || zone;
  }
}
