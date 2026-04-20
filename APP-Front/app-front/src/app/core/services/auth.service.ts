import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  name: string;
  role_id: string | number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role_id?: number;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

export interface UpdateProfileResponse {
  success: boolean;
  message?: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  language: string;
  theme: string;
  notifications_enabled: boolean;
}

export interface UpdatePreferencesRequest {
  language?: string;
  theme?: string;
  notifications_enabled?: boolean;
}

export interface PreferencesResponse {
  success: boolean;
  data: UserPreferences | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private currentUserSignal = signal<User | null>(this.getStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly isAdmin = computed(() => this.currentUserSignal()?.role_id === 1);

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/api/auth/login`, credentials)
      .pipe(
        tap((response) => {
          if (response.success) {
            this.storeToken(response.data.token);
            this.storeUser(response.data.user);
            this.currentUserSignal.set(response.data.user);
          }
        }),
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/api/auth/register`, data)
      .pipe(
        tap((response) => {
          if (response.success) {
            this.storeToken(response.data.token);
            this.storeUser(response.data.user);
            this.currentUserSignal.set(response.data.user);
          }
        }),
      );
  }

  me(): Observable<AuthResponse | null> {
    const token = this.getToken();
    if (!token) {
      return of(null);
    }

    return this.http.get<AuthResponse>(`${this.API_URL}/api/auth/me`).pipe(
      tap((response) => {
        if (response.success) {
          this.storeUser(response.data.user);
          this.currentUserSignal.set(response.data.user);
        }
      }),
      catchError(() => {
        this.logout();
        return of(null);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  updateProfile(
    data: UpdateProfileRequest,
    headers: { [key: string]: string },
  ): Observable<UpdateProfileResponse> {
    return this.http
      .put<UpdateProfileResponse>(`${this.API_URL}/api/users/profile`, data, {
        headers,
      })
      .pipe(
        tap((response) => {
          if (response.success) {
            const storedUser = this.getStoredUser();
            if (storedUser) {
              const updatedUser: User = {
                ...storedUser,
                ...(data.name && { name: data.name }),
                ...(data.email && { email: data.email }),
              };
              this.storeUser(updatedUser);
              this.currentUserSignal.set(updatedUser);
            }
          }
        }),
      );
  }

  getPreferences(headers: { [key: string]: string }): Observable<PreferencesResponse> {
    return this.http.get<PreferencesResponse>(`${this.API_URL}/api/users/preferences`, {
      headers,
    });
  }

  updatePreferences(
    data: UpdatePreferencesRequest,
    headers: { [key: string]: string },
  ): Observable<PreferencesResponse> {
    return this.http.put<PreferencesResponse>(`${this.API_URL}/api/users/preferences`, data, {
      headers,
    });
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private storeUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getStoredUser(): User | null {
    const stored = localStorage.getItem(this.USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }
}
