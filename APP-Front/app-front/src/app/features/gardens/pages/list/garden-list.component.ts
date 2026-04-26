import { Component, inject, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GardenService, MyGardensResponse, PendingInvitation } from '../../services/garden.service';
import { TranslationService } from '../../../../core/services/i18n/translation.service';
import { TranslatePipe } from '../../../../core/services/i18n/translate.pipe';

type TabType = 'own' | 'shared';

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

  activeTab = signal<TabType>('own');
  myGardensData = signal<MyGardensResponse | null>(null);

  ngOnInit(): void {
    this.loadMyGardens();
  }

  loadMyGardens(): void {
    this.gardenService.getMyGardens()?.subscribe({
      next: (response) => {
        if (response?.data) {
          this.myGardensData.set(response.data);
        }
      }
    });
  }

  setTab(tab: TabType): void {
    this.activeTab.set(tab);
  }

  get displayedGardens() {
    const data = this.myGardensData();
    if (!data) return [];
    return this.activeTab() === 'own' ? data.own : data.shared;
  }

  get pendingInvitations(): PendingInvitation[] {
    return this.myGardensData()?.pendingInvitations || [];
  }

  get hasPendingInvitations(): boolean {
    return this.pendingInvitations.length > 0;
  }

  acceptInvitation(gardenId: string): void {
    this.gardenService.acceptInvitation(gardenId)?.subscribe({
      next: () => this.loadMyGardens()
    });
  }

  rejectInvitation(gardenId: string): void {
    this.gardenService.rejectInvitation(gardenId)?.subscribe({
      next: () => this.loadMyGardens()
    });
  }

  getClimateLabel(zone: string): string {
    const key = `gardens.climateZones.${zone}`;
    return this.translationService.t(key) || zone;
  }
}
