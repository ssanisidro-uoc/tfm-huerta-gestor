import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CropService } from '../../services/crop.service';
import { TranslatePipe } from '../../../../core/services/i18n/translate.pipe';

@Component({
  selector: 'app-crop-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './crop-list.component.html',
  styleUrl: './crop-list.component.scss'
})
export class CropListComponent implements OnInit {
  searchTerm = signal('');
  categoryLabels: Record<string, string> = {
    'vegetable': 'Hortaliza',
    'fruit': 'Fruta',
    'herb': 'Hierba',
    'flower': 'Flor',
    'cereal': 'Cereal',
    'legume': 'Legumbre'
  };

  constructor(public cropService: CropService) {}

  ngOnInit(): void {
    this.cropService.getCrops().subscribe();
  }

  onSearch(): void {
    const search = this.searchTerm().trim();
    if (search.length >= 2) {
      this.cropService.getCrops(1, 50, undefined, undefined, search).subscribe();
    } else if (search.length === 0) {
      this.cropService.getCrops().subscribe();
    }
  }

  getCategoryLabel(category: string): string {
    return this.categoryLabels[category] || category;
  }
}
