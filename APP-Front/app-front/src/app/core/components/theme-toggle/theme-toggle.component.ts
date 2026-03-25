import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="theme-toggle" 
      (click)="themeService.toggle()"
      [attr.aria-label]="themeService.isDarkMode() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
      [title]="themeService.isDarkMode() ? 'Modo claro' : 'Modo oscuro'"
    >
      <span class="icon-wrapper" [class.dark]="themeService.isDarkMode()">
        <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </span>
    </button>
  `,
  styles: [`
    .theme-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: var(--bg-tertiary);
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 0;

      &:hover {
        background: var(--color-primary-light);
        
        .icon-wrapper {
          color: white;
        }
      }
    }

    .icon-wrapper {
      position: relative;
      width: 20px;
      height: 20px;
      color: var(--text-primary);
      transition: all 0.4s ease;

      &.dark {
        transform: rotate(180deg);

        .sun-icon {
          opacity: 0;
          transform: scale(0);
        }

        .moon-icon {
          opacity: 1;
          transform: scale(1);
        }
      }
    }

    .sun-icon, .moon-icon {
      position: absolute;
      top: 0;
      left: 0;
      transition: all 0.4s ease;
    }

    .sun-icon {
      opacity: 1;
      transform: scale(1);
    }

    .moon-icon {
      opacity: 0;
      transform: scale(0);
    }
  `]
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
}