import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface PlantingAssociation {
  id: string;
  primary_planting_id: string;
  companion_planting_id: string;
  primary_crop_name: string;
  companion_crop_name: string;
  compatibility_id?: string;
  actual_distance_cm?: number;
  actual_arrangement?: string;
  purpose?: string;
  expected_benefit?: string;
  is_active: boolean;
  created_at: string;
}

export interface AssociationObservation {
  id: string;
  association_id: string;
  observation_date: string;
  observation_type: string;
  outcome: string;
  effectiveness_rating?: number;
  description: string;
  primary_crop_name: string;
  companion_crop_name: string;
}

export interface CompanionSuggestion {
  plantingId: string;
  cropName: string;
  cropFamily: string;
  compatibility: 'good' | 'bad' | 'neutral';
  reason?: string;
  cropCatalogId?: string;
}

export interface ActivePlanting {
  id: string;
  cropCatalogId: string;
  crop_name: string;
  family: string;
}

export interface AssociationReport {
  primary_crop_name: string;
  companion_crop_name: string;
  observation_count: number;
  avg_rating: number | null;
  most_common_outcome: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlantingAssociationsService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getByPlanting(plantingId: string): Observable<{ success: boolean; data: PlantingAssociation[] }> {
    return this.http.get<{ success: boolean; data: PlantingAssociation[] }>(
      `${this.API_URL}/api/plantings/${plantingId}/associations`
    );
  }

  getByPlot(plotId: string): Observable<{ success: boolean; data: PlantingAssociation[] }> {
    return this.http.get<{ success: boolean; data: PlantingAssociation[] }>(
      `${this.API_URL}/api/plots/${plotId}/associations`
    );
  }

  getById(id: string): Observable<{ success: boolean; data: PlantingAssociation }> {
    return this.http.get<{ success: boolean; data: PlantingAssociation }>(
      `${this.API_URL}/api/associations/${id}`
    );
  }

  create(plantingId: string, data: {
    companion_planting_id: string;
    actual_distance_cm?: number;
    actual_arrangement?: string;
    purpose?: string;
    expected_benefit?: string;
  }): Observable<{ success: boolean; data: PlantingAssociation }> {
    return this.http.post<{ success: boolean; data: PlantingAssociation }>(
      `${this.API_URL}/api/plantings/${plantingId}/associations`,
      data
    );
  }

  delete(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${this.API_URL}/api/associations/${id}`
    );
  }

  createObservation(associationId: string, data: {
    observation_type: string;
    outcome: string;
    effectiveness_rating?: number;
    description: string;
    measured_data?: Record<string, any>;
  }): Observable<{ success: boolean; data: AssociationObservation }> {
    return this.http.post<{ success: boolean; data: AssociationObservation }>(
      `${this.API_URL}/api/associations/${associationId}/observations`,
      data
    );
  }

  getObservations(associationId: string): Observable<{ success: boolean; data: AssociationObservation[] }> {
    return this.http.get<{ success: boolean; data: AssociationObservation[] }>(
      `${this.API_URL}/api/associations/${associationId}/observations`
    );
  }

  getReport(plotId: string): Observable<{ success: boolean; data: AssociationReport[] }> {
    return this.http.get<{ success: boolean; data: AssociationReport[] }>(
      `${this.API_URL}/api/plots/${plotId}/association-report`
    );
  }

  getCompanionSuggestions(plotId: string, cropCatalogId: string): Observable<{ success: boolean; data: CompanionSuggestion[] }> {
    return this.http.get<{ success: boolean; data: CompanionSuggestion[] }>(
      `${this.API_URL}/api/plots/${plotId}/companion-suggestions`,
      { params: { cropCatalogId } }
    );
  }

  getActivePlantings(plotId: string): Observable<{ success: boolean; data: ActivePlanting[] }> {
    return this.http.get<{ success: boolean; data: ActivePlanting[] }>(
      `${this.API_URL}/api/plots/${plotId}/active-plantings`
    );
  }
}
