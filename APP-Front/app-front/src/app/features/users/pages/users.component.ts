import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UpdateProfileRequest, UpdateProfileResponse } from '../../../core/services/auth.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UserComponent {
  name = '';
  email = '';
  currentPassword = '';
  newPassword = '';

  loading = signal(false);
  error = signal('');
  success = signal('');
  validationErrors = signal<Record<string, string>>({});

  validate(): boolean {
    const errors: Record<string, string> = {};

    if (this.name.trim().length < 2) {
      errors['name'] = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!EMAIL_REGEX.test(this.email)) {
      errors['email'] = 'Introduce un email válido';
    }

    if (this.newPassword && this.newPassword.length < 8) {
      errors['newPassword'] = 'La nueva contraseña debe tener al menos 8 caracteres';
    }

    if (this.newPassword && !this.currentPassword) {
      errors['currentPassword'] = 'Introduce la contraseña actual';
    }

    this.validationErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    const user = this.authService.currentUser();
    if (user) {
      this.name = user.name;
      this.email = user.email;
    }
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
          this.success.set('Perfil actualizado correctamente');
          this.currentPassword = '';
          this.newPassword = '';
          setTimeout(() => this.router.navigate(['/']), 2000);
        }
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error al actualizar el perfil');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
