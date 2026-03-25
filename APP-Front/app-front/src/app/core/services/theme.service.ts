import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'huerta-theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkSignal = signal<boolean>(this.getInitialTheme());

  readonly isDarkMode = this.isDarkSignal.asReadonly();

  constructor() {
    effect(() => {
      const isDark = this.isDarkSignal();
      this.applyTheme(isDark);
      localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
    });
  }

  private getInitialTheme(): boolean {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  toggle(): void {
    this.isDarkSignal.update(v => !v);
  }

  setTheme(dark: boolean): void {
    this.isDarkSignal.set(dark);
  }
}