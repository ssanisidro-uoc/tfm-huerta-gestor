import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslationService } from '../../../../core/services/i18n/translation.service';
import { TranslatePipe } from '../../../../core/services/i18n/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private translationService = inject(TranslationService);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  onSubmit(): void {
    this.error.set('');
    
    if (!this.email || !this.password) {
      this.error.set(this.translationService.t('auth.fillAllFields') || 'Por favor, completa todos los campos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.error.set(this.translationService.t('auth.invalidEmail') || 'Por favor, introduce un email válido');
      return;
    }

    if (this.password.length < 6) {
      this.error.set(this.translationService.t('auth.passwordMinLength') || 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.loading.set(true);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(err.error?.message || this.translationService.t('auth.loginError'));
      }
    });
  }
}
