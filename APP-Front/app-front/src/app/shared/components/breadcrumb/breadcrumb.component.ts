import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  routerLink?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol class="breadcrumb-list">
        <li class="breadcrumb-item" *ngFor="let item of items; let last = last">
          @if (last || !item.routerLink) {
            <span class="breadcrumb-current" aria-current="page">{{ item.label }}</span>
          } @else {
            <a [routerLink]="item.routerLink" class="breadcrumb-link">{{ item.label }}</a>
            <svg class="breadcrumb-separator" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          }
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb {
      padding: 0.75rem 0;
    }

    .breadcrumb-list {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.25rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .breadcrumb-link {
      color: var(--color-primary);
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s;

      &:hover {
        color: var(--color-primary-hover);
      }
    }

    .breadcrumb-current {
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .breadcrumb-separator {
      color: var(--text-muted);
    }
  `]
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
}