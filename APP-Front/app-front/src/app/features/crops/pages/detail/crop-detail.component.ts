import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CropService, CropDetail } from '../../services/crop.service';

@Component({
  selector: 'app-crop-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './crop-detail.component.html',
  styleUrl: './crop-detail.component.scss'
})
export class CropDetailComponent implements OnInit {
  crop = signal<CropDetail | null>(null);

  constructor(
    private route: ActivatedRoute,
    public cropService: CropService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadCrop(id);
  }

  loadCrop(id: string): void {
    this.cropService.getCropById(id).subscribe({
      next: (c) => { if (c) this.crop.set(c); }
    });
  }
}
