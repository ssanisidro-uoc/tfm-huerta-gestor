import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class.hoverable]="hoverable" [class.clickable]="clickable" (click)="onClick()">
      <div class="card-header" *ngIf="title || headerTemplate">
        <ng-content select="[card-header]"></ng-content>
        <h3 *ngIf="title">{{ title }}</h3>
      </div>
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      <div class="card-footer" *ngIf="footerTemplate">
        <ng-content select="[card-footer]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      box-shadow: var(--shadow);
      overflow: hidden;
      transition: all 0.2s ease;

      &.hoverable:hover {
        box-shadow: var(--shadow-md);
      }

      &.clickable {
        cursor: pointer;
      }
    }

    .card-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-color);

      h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    .card-body {
      padding: 1.25rem;
    }

    .card-footer {
      padding: 1rem 1.25rem;
      border-top: 1px solid var(--border-color);
      background: var(--bg-tertiary);
    }
  `]
})
export class CardComponent {
  @Input() title?: string;
  @Input() hoverable = false;
  @Input() clickable = false;

  onClick(): void {
    if (this.clickable) {
      // Emit click event if needed
    }
  }
}