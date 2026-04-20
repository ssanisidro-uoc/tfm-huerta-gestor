import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UpdateProfileRequest, UpdateProfileResponse, UserPreferences } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/i18n/translation.service';
import { TranslatePipe } from '../../../core/services/i18n/translate.pipe';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UserComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private translationService = inject(TranslationService);

  name = '';
  email = '';
  currentPassword = '';
  newPassword = '';

  language = 'es';
  theme = 'light';
  notificationsEnabled = true;

  loading = signal(false);
  loadingPrefs = signal(false);
  error = signal('');
  success = signal('');
  validationErrors = signal<Record<string, string>>({});

  languages = [
    { value: 'es', label: 'Español' },
    { value: 'ca', label: 'Català' },
    { value: 'gl', label: 'Gallego' },
  ];

  themes = [
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Oscuro' },
    { value: 'auto', label: 'Automático' },
  ];

  validate(): boolean {
    const errors: Record<string, string> = {};

    if (this.name.trim().length < 2) {
      errors['name'] = this.translationService.t('profile.nameMinLength') || 'El nombre debe tener al menos 2 caracteres';
    }

    if (!EMAIL_REGEX.test(this.email)) {
      errors['email'] = this.translationService.t('profile.invalidEmail') || 'Introduce un email válido';
    }

    if (this.newPassword && this.newPassword.length < 8) {
      errors['newPassword'] = this.translationService.t('profile.passwordTooShort') || 'La nueva contraseña debe tener al menos 8 caracteres';
    }

    if (this.newPassword && !this.currentPassword) {
      errors['currentPassword'] = this.translationService.t('profile.currentPasswordRequired') || 'Introduce la contraseña actual';
    }

    this.validationErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  constructor(
    private authServiceConstructor: AuthService,
    private routerConstructor: Router,
  ) {
    const user = this.authServiceConstructor.currentUser();
    if (user) {
      this.name = user.name;
      this.email = user.email;
    }
  }

  ngOnInit(): void {
    this.loadPreferences();
  }

  loadPreferences(): void {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    this.loadingPrefs.set(true);
    this.authService.getPreferences({ userId }).subscribe({
      next: (response) => {
        this.loadingPrefs.set(false);
        if (response.data) {
          this.language = response.data.language;
          this.theme = response.data.theme;
          this.notificationsEnabled = response.data.notifications_enabled;
        }
      },
      error: () => {
        this.loadingPrefs.set(false);
      },
    });
  }

  onSubmit(): void {
    this.error.set('');
    this.success.set('');
    this.validationErrors.set({});

    if (!this.validate()) {
      return;
    }

    this.loading.set(true);

    const data: UpdateProfileRequest = {
      name: this.name,
      email: this.email,
    };

    if (this.currentPassword && this.newPassword) {
      data.currentPassword = this.currentPassword;
      data.newPassword = this.newPassword;
    }
    const userId = this.authService.currentUser()?.id;
    this.authService.updateProfile(data, { userId: userId || '' }).subscribe({
      next: (response: UpdateProfileResponse) => {
        this.loading.set(false);
        if (response.success) {
          this.success.set(this.translationService.t('profile.profileUpdated'));
          this.currentPassword = '';
          this.newPassword = '';
          this.savePreferences();
        }
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err.error?.message || this.translationService.t('errors.serverError'));
      },
    });
  }

  savePreferences(): void {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    this.authService.updatePreferences(
      {
        language: this.language,
        theme: this.theme,
        notifications_enabled: this.notificationsEnabled,
      },
      { userId }
    ).subscribe({
      next: () => {
        this.translationService.setLanguage(this.language);
        this.applyTheme(this.theme);
      },
    });
  }

  private applyTheme(theme: string): void {
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
