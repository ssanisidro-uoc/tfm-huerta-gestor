import { Injectable, signal, effect, inject, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { environment } from '../../../../environments/environment';

type Translations = Record<string, any>;

const FALLBACK_TRANSLATIONS: Translations = {
  app: { loading: 'Cargando...', error: 'Error', yes: 'Sí', no: 'No', na: 'N/A' },
  gardens: { 
    title: 'Mis Huertas', 
    create: 'Crear Huerta', 
    edit: 'Editar Huerta',
    delete: 'Eliminar Huerta',
    editGarden: 'Editar Huerta',
    invite: 'Invitar',
    plots: 'Parcelas', 
    crops: 'Cultivos',
    tasks: 'Tareas',
    newPlot: 'Nueva Parcela', 
    noPlots: 'No hay parcelas todavía', 
    createFirstPlot: 'Crear primera parcela',
    noGardens: 'No tienes huertas todavía',
    createFirst: 'Crea tu primera huerta',
    active: 'Activa',
    inactive: 'Inactiva',
    view: 'Ver',
    total: 'Total',
    activeCrops: 'cultivos activos',
    owner: 'Propietario',
    noCrop: 'Sin cultivo'
  },
  plots: { 
    title: 'Parcelas', 
    create: 'Crear Parcela', 
    edit: 'Editar Parcela',
    noPlots: 'No hay parcelas',
    yes: 'Sí',
    no: 'No',
    daysCultivated: 'días de cultivo',
    plants: 'plantas'
  },
  crops: { 
    title: 'Cultivos', 
    category: 'Categoría', 
    lifecycle: 'Ciclo de vida', 
    growthHabit: 'Hábito de crecimiento', 
    sunNeed: 'Necesidad de sol',
    na: 'N/A'
  },
  lunar: {
    newMoon: 'Luna Nueva',
    fullMoon: 'Luna Llena'
  }
};

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private translations: Translations = {};
  private currentLanguage = signal<string>('es');
  private isLoaded = signal<boolean>(false);

  readonly language = this.currentLanguage.asReadonly();
  readonly isReady = this.isLoaded.asReadonly();

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Initialize with fallback IMMEDIATELY so translations work from the start
    this.translations = { ...FALLBACK_TRANSLATIONS };
    this.isLoaded.set(true);
    
    // Then load actual translations in background
    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('app_language') || 'es';
      this.currentLanguage.set(savedLang);
      this.loadTranslationsInBackground(savedLang);
    }
    
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.loadUserPreferences(user.id);
      }
    });
  }

  private loadTranslationsInBackground(lang: string): void {
    this.http.get<Translations>(`/i18n/${lang}.json`).subscribe({
      next: (data) => {
        this.translations = { ...FALLBACK_TRANSLATIONS, ...data };
      },
      error: () => {}
    });
  }

  private loadUserPreferences(userId: string): void {
    const token = this.authService.getToken();
    if (!token) return;

    this.http.get<{ success: boolean; data: any }>(`${environment.apiUrl}/api/users/preferences`, {
      headers: { userId }
    }).subscribe({
      next: (response) => {
        if (response.data?.language) {
          this.setLanguage(response.data.language);
        }
      },
      error: (err) => {
        if (err.status === 401) {
          this.authService.logout();
        }
      }
    });
  }

  async setLanguage(lang: string): Promise<void> {
    const validLangs = ['es', 'ca', 'gl'];
    if (!validLangs.includes(lang)) {
      lang = 'es';
    }

    this.currentLanguage.set(lang);
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('app_language', lang);
    }

    await this.loadTranslations(lang);
  }

  private loadTranslations(lang: string): Promise<void> {
    console.log('[i18n] Loading translations for:', lang);
    return new Promise((resolve) => {
      this.http.get<Translations>(`/i18n/${lang}.json`).subscribe({
        next: (data) => {
          console.log('[i18n] Loaded successfully:', lang, 'Keys:', Object.keys(data).length);
          this.translations = { ...FALLBACK_TRANSLATIONS, ...data };
          this.isLoaded.set(true);
          resolve();
        },
        error: (err) => {
          console.error('[i18n] Failed to load:', lang, err);
          if (lang !== 'es') {
            this.http.get<Translations>(`/i18n/es.json`).subscribe({
              next: (data) => {
                console.log('[i18n] Fallback to es loaded, Keys:', Object.keys(data).length);
                this.translations = { ...FALLBACK_TRANSLATIONS, ...data };
                this.isLoaded.set(true);
                resolve();
              },
              error: (err2) => {
                console.error('[i18n] Fallback also failed:', err2);
                this.translations = FALLBACK_TRANSLATIONS;
                this.isLoaded.set(true);
                resolve();
              }
            });
          } else {
            console.log('[i18n] Using fallback only');
            this.translations = { ...FALLBACK_TRANSLATIONS };
            this.isLoaded.set(true);
            resolve();
          }
        }
      });
    });
  }

  t(key: string, params?: Record<string, string | number>): string {
    if (!this.isLoaded()) {
      console.log('[i18n] Not loaded yet, returning key:', key);
      return key;
    }

    const keys = key.split('.');
    let value: any = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        value = null;
        break;
      }
    }

    if (!value || typeof value !== 'string') {
      value = this.getFromFallback(key);
      if (!value) {
        console.log('[i18n] Key not found:', key);
        return key;
      }
    }

    if (params) {
      return this.interpolate(value, params);
    }

    return value;
  }

  private getFromFallback(key: string): string | null {
    const keys = key.split('.');
    let value: any = FALLBACK_TRANSLATIONS;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.log('[i18n] Fallback - key not found:', key);
        return null;
      }
    }

    if (typeof value === 'string') {
      console.log('[i18n] Found in fallback:', key, '=', value);
      return value;
    }
    return null;
  }

  private interpolate(text: string, params: Record<string, string | number>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (_, k) => {
      return params[k] !== undefined ? String(params[k]) : `{{${k}}}`;
    });
  }
}