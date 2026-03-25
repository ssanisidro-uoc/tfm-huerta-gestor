import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UpdateProfileRequest, UpdateProfileResponse } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <h2>Editar Perfil</h2>
      
      @if (error()) {
        <div class="error-message">{{ error() }}</div>
      }
      
      @if (success()) {
        <div class="success-message">{{ success() }}</div>
      }
      
      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="name">Nombre</label>
          <input 
            type="text" 
            id="name" 
            [(ngModel)]="name" 
            name="name"
            placeholder="Tu nombre"
          />
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            [(ngModel)]="email" 
            name="email"
            placeholder="tu@email.com"
          />
        </div>
        
        <hr />
        <h3>Cambiar contraseña (opcional)</h3>
        
        <div class="form-group">
          <label for="currentPassword">Contraseña actual</label>
          <input 
            type="password" 
            id="currentPassword" 
            [(ngModel)]="currentPassword" 
            name="currentPassword"
            placeholder="••••••••"
          />
        </div>
        
        <div class="form-group">
          <label for="newPassword">Nueva contraseña</label>
          <input 
            type="password" 
            id="newPassword" 
            [(ngModel)]="newPassword" 
            name="newPassword"
            placeholder="Mínimo 8 caracteres"
          />
        </div>
        
        <button type="submit" [disabled]="loading()">
          {{ loading() ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </form>
      
      <button class="btn-cancel" (click)="goBack()">Cancelar</button>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 500px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    h2 {
      margin-bottom: 1.5rem;
      color: #2c3e50;
    }
    
    h3 {
      margin: 1.5rem 0 1rem;
      color: #34495e;
      font-size: 1.1rem;
    }
    
    hr {
      margin: 1.5rem 0;
      border: none;
      border-top: 1px solid #eee;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }
    
    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    
    input:focus {
      outline: none;
      border-color: #3498db;
    }
    
    button {
      width: 100%;
      padding: 0.75rem;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 1rem;
    }
    
    button:hover:not(:disabled) {
      background: #2980b9;
    }
    
    button:disabled {
      background: #95a5a6;
      cursor: not-allowed;
    }
    
    .btn-cancel {
      background: transparent;
      color: #7f8c8d;
      margin-top: 0.5rem;
    }
    
    .btn-cancel:hover {
      color: #34495e;
      background: #ecf0f1;
    }
    
    .error-message {
      background: #fee;
      color: #c0392b;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    
    .success-message {
      background: #efe;
      color: #27ae60;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
  `]
})
export class ProfileComponent {
  name = '';
  email = '';
  currentPassword = '';
  newPassword = '';
  
  loading = signal(false);
  error = signal('');
  success = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    const user = this.authService.currentUser();
    if (user) {
      this.name = user.name;
      this.email = user.email;
    }
  }

  onSubmit(): void {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    const data: UpdateProfileRequest = {
      name: this.name,
      email: this.email
    };

    if (this.currentPassword && this.newPassword) {
      data.currentPassword = this.currentPassword;
      data.newPassword = this.newPassword;
    }

    this.authService.updateProfile(data).subscribe({
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
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
