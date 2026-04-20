import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss'
})
export class ProgressBarComponent {
  @Input() value: number = 0;
  @Input() max: number = 100;
  @Input() label: string = '';
  @Input() showValue: boolean = true;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() color: 'default' | 'success' | 'warning' | 'error' = 'default';

  get percentage(): number {
    return Math.min(Math.max((this.value / this.max) * 100, 0), 100);
  }

  get colorClass(): string {
    if (this.color !== 'default') return this.color;
    if (this.percentage <= 25) return 'error';
    if (this.percentage <= 50) return 'warning';
    return 'success';
  }
}