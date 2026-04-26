import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
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
  location: {
    address?: string;
    city: string;
    region?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };
}

export interface LocationValidation {
  valid: boolean;
  location?: {
    city: string;
    region?: string;
    country: string;
    latitude: number;
    longitude: number;
    displayName: string;
  };
  error?: string;
}

export interface CitySuggestion {
  city: string;
  region?: string;
  country: string;
  latitude: number;
  longitude: number;
  displayName: string;
}

export interface UpdateGardenRequest {
  name?: string;
  description?: string | null;
  surface_m2?: number | null;
  climate_zone?: string;
  hardiness_zone?: string | null;
  location: {
    address?: string;
    city: string;
    region?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };
  is_active?: boolean;
}

export interface SharedGardensResponse {
  success: boolean;
  data: SharedGarden[];
}

export interface SharedGarden {
  garden_id: string;
  garden_role: string;
  invitation_accepted: boolean;
  invitation_accepted_at: string | null;
  created_at: Date;
  garden: {
    id: string;
    name: string;
    climate_zone: string;
    location: GardenLocation;
  } | null;
}

export interface PendingInvitation {
  id: string;
  garden_id: string;
  garden: {
    id: string;
    name: string;
    climate_zone: string;
    location: GardenLocation;
  };
  invited_by: string;
  invited_by_name: string;
  invited_by_email: string;
  invited_at: Date;
}

export interface MyGardensResponse {
  own: SharedGarden[];
  shared: SharedGarden[];
  pendingInvitations: PendingInvitation[];
}

export interface MyGardensApiResponse {
  success: boolean;
  data: MyGardensResponse;
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

  setError(message: string): void {
    this.errorSignal.set(message);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  getGardens(page = 1, limit = 20): Observable<GardensResponse | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<GardensResponse>(`${this.API_URL}/api/gardens`, {
      params: { page: page.toString(), limit: limit.toString() }
    }).pipe(
      tap(response => {
        this.gardensSignal.set(response.gardens);
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        const message = err.error?.message || 'Error loading gardens';
        this.errorSignal.set(message);
        return of(null);
      })
    );
  }

  getGardenById(id: string): Observable<GardenDetail | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<GardenDetail>(`${this.API_URL}/api/gardens/${id}`).pipe(
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

    return this.http.post<{ message: string }>(`${this.API_URL}/api/gardens`, data).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        const message = err.error?.message || 'Error creating garden';
        this.errorSignal.set(message);
        return of(null);
      })
    );
  }

  updateGarden(id: string, data: Partial<UpdateGardenRequest>): Observable<{ message: string } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<{ message: string }>(`${this.API_URL}/api/gardens/${id}`, data).pipe(
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

  validateLocation(city: string, region?: string, country?: string): Observable<LocationValidation | null> {
    const params = new URLSearchParams({ city });
    if (region) params.append('region', region);
    if (country) params.append('country', country);

    return this.http.get<LocationValidation>(`${this.API_URL}/api/gardens/validate-location?${params.toString()}`).pipe(
      catchError((err: HttpErrorResponse) => {
        return of(null);
      })
    );
  }

  searchCities(query: string, country?: string): Observable<CitySuggestion[]> {
    const params = new URLSearchParams({ q: query });
    if (country) params.append('country', country);

    return this.http.get<{ suggestions: CitySuggestion[] }>(`${this.API_URL}/api/gardens/search-cities?${params.toString()}`).pipe(
      map(response => response.suggestions || []),
      catchError(() => of([]))
    );
  }

  deleteGarden(id: string): Observable<{ message: string } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<{ message: string }>(`${this.API_URL}/api/gardens/${id}`).pipe(
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

  inviteCollaborator(gardenId: string, email: string, role: string = 'collaborator'): Observable<InviteResponse | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<InviteResponse>(`${this.API_URL}/api/gardens/${gardenId}/collaborators`, { email, role }).pipe(
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

    return this.http.get<SharedGardensResponse>(`${this.API_URL}/api/gardens/shared`).pipe(
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

  getMyGardens(): Observable<MyGardensApiResponse | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<MyGardensApiResponse>(`${this.API_URL}/api/gardens/my-gardens`).pipe(
      tap(response => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error loading gardens');
        return of(null);
      })
    );
  }

  acceptInvitation(gardenId: string): Observable<{ success: boolean; message: string } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/api/gardens/${gardenId}/accept`, {}).pipe(
      tap(response => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error accepting invitation');
        return of(null);
      })
    );
  }

  rejectInvitation(gardenId: string): Observable<{ success: boolean; message: string } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/api/gardens/${gardenId}/reject`, {}).pipe(
      tap(response => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error rejecting invitation');
        return of(null);
      })
    );
  }

  getGardenCollaborators(gardenId: string): Observable<{ collaborators: any[] } | null> {
    return this.http.get<{ collaborators: any[] }>(`${this.API_URL}/api/gardens/${gardenId}/collaborators`).pipe(
      catchError((err: HttpErrorResponse) => {
        this.errorSignal.set(err.error?.message || 'Error loading collaborators');
        return of(null);
      })
    );
  }

  updateCollaboratorRole(gardenId: string, collaboratorId: string, role: string): Observable<{ success: boolean; message: string } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.patch<{ success: boolean; message: string }>(
      `${this.API_URL}/api/gardens/${gardenId}/collaborators/${collaboratorId}`,
      { role }
    ).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error updating collaborator role');
        return of(null);
      })
    );
  }

  removeCollaborator(gardenId: string, collaboratorId: string): Observable<{ success: boolean; message: string } | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<{ success: boolean; message: string }>(
      `${this.API_URL}/api/gardens/${gardenId}/collaborators/${collaboratorId}`
    ).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.error?.message || 'Error removing collaborator');
        return of(null);
      })
    );
  }
}
