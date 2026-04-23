import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslationService } from '../../../../core/services/i18n/translation.service';
import { TranslatePipe } from '../../../../core/services/i18n/translate.pipe';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private translationService = inject(TranslationService);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = signal(false);
  error = signal('');

  passwordRequirements = {
    minLength: signal(false),
    hasNumber: signal(false),
    hasLowercase: signal(false),
    hasUppercase: signal(false),
    hasSpecial: signal(false)
  };

  onPasswordChange(): void {
    const pwd = this.password;
    this.passwordRequirements.minLength.set(pwd.length >= 8);
    this.passwordRequirements.hasNumber.set(/[0-9]/.test(pwd));
    this.passwordRequirements.hasLowercase.set(/[a-z]/.test(pwd));
    this.passwordRequirements.hasUppercase.set(/[A-Z]/.test(pwd));
    this.passwordRequirements.hasSpecial.set(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pwd));
  }

  isPasswordValid(): boolean {
    const req = this.passwordRequirements;
    return req.minLength() && req.hasNumber() && req.hasLowercase() && req.hasUppercase() && req.hasSpecial();
  }

  onSubmit(): void {
    this.error.set('');

    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.error.set(this.translationService.t('auth.fillAllFields') || 'Por favor, completa todos los campos');
      return;
    }

    if (this.name.length < 2) {
      this.error.set(this.translationService.t('profile.nameMinLength') || 'El nombre debe tener al menos 2 caracteres');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.error.set(this.translationService.t('auth.invalidEmail') || 'Por favor, introduce un email válido');
      return;
    }

    if (!this.isPasswordValid()) {
      this.error.set(this.translationService.t('auth.passwordRequirements') || 'La contraseña no cumple los requisitos mínimos');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error.set(this.translationService.t('auth.passwordMismatch') || 'Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);

    this.authService.register({
      name: this.name,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(err.error?.message || this.translationService.t('auth.registerError'));
      }
    });
  }
}
