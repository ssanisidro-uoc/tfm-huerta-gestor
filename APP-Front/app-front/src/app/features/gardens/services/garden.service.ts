import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface GardenLocation {
  address: string | null;
  city: string | null;
  region: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
}

export interface Garden {
  id: string;
  name: string;
  description: string | null;
  climate_zone: string;
  surface_m2: number | null;
  location: GardenLocation;
  is_active: boolean;
  created_at: Date;
}

export interface GardenDetail extends Garden {
  owner_id: string;
  hardiness_zone: string | null;
  updated_at: Date;
}

export interface GardensResponse {
  gardens: Garden[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface CreateGardenRequest {
  name: string;
  description?: string;
  surface_m2?: number;
  climate_zone: string;
  hardiness_zone?: string;
  location?: {
    address?: string;
    city?: string;
    region?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };
}

export interface SharedGardensResponse {
  success: boolean;
  data: SharedGarden[];
}

export interface SharedGarden {
  garden_id: string;
  garden_role: string;
  invitation_accepted: boolean;
  created_at: Date;
  garden: {
    id: string;
    name: string;
    climate_zone: string;
    location: GardenLocation;
  } | null;
}

export interface InviteResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class GardenService {
  private readonly API_URL = environment.apiUrl;

  private gardensSignal = signal<Garden[]>([]);
  private sharedGardensSignal = signal<SharedGarden[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly gardens = this.gardensSignal.asReadonly();
  readonly sharedGardens = this.sharedGardensSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor(private http: HttpClient) {}

  getGardens(page = 1, limit = 20): Observable<GardensResponse | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<GardensResponse>(`${this.API_URL}/gardens`, {
      params: { page: page.toString(), limit: limit.toString() }
    }).pipe(
      tap(response => {
        this.gardensSignal.set(response.gardens);
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error loading gardens');
        return of(null);
      })
    );
  }

  getGardenById(id: string): Observable<GardenDetail | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<GardenDetail>(`${this.API_URL}/gardens/${id}`).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error loading garden');
        return of(null);
      })
    );
  }

  createGarden(data: CreateGardenRequest): Observable<{ message: string } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<{ message: string }>(`${this.API_URL}/gardens`, data).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error creating garden');
        return of(null);
      })
    );
  }

  updateGarden(id: string, data: Partial<CreateGardenRequest>): Observable<{ message: string } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<{ message: string }>(`${this.API_URL}/gardens/${id}`, data).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error updating garden');
        return of(null);
      })
    );
  }

  deleteGarden(id: string): Observable<{ message: string } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<{ message: string }>(`${this.API_URL}/gardens/${id}`).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error deleting garden');
        return of(null);
      })
    );
  }

  inviteCollaborator(gardenId: string, email: string): Observable<InviteResponse | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<InviteResponse>(`${this.API_URL}/gardens/${gardenId}/invite`, { email }).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error sending invitation');
        return of(null);
      })
    );
  }

  getSharedGardens(): Observable<SharedGardensResponse | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<SharedGardensResponse>(`${this.API_URL}/gardens/shared`).pipe(
      tap(response => {
        this.sharedGardensSignal.set(response.data);
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error loading shared gardens');
        return of(null);
      })
    );
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}
