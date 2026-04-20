import { Pool } from 'pg';
import { PostgresPlantingAssociationsRepository, PlantingAssociationWithNames } from '../infrastructure/persistence/PostgresPlantingAssociationsRepository';
import { PostgresAssociationObservationsRepository, AssociationObservationWithNames } from '../infrastructure/persistence/PostgresAssociationObservationsRepository';
import { PostgresCropCompatibilityRepository } from '../../Crop/infrastructure/persistence/PostgresCropCompatibilityRepository';

export interface CreateAssociationCommand {
  primaryPlantingId: string;
  companionPlantingId: string;
  actualDistanceCm?: number;
  actualArrangement?: string;
  actualRatio?: string;
  purpose?: string;
  expectedBenefit?: string;
  userNotes?: string;
}

export interface CreateObservationCommand {
  associationId: string;
  observedBy?: string;
  observationType: string;
  outcome: string;
  effectivenessRating?: number;
  description: string;
  measuredData?: Record<string, any>;
}

export interface CompanionSuggestion {
  plantingId: string;
  cropName: string;
  cropFamily: string;
  compatibility: 'good' | 'bad' | 'neutral';
  reason?: string;
}

export class PlantingAssociationsService {
  constructor(
    private associationsRepository: PostgresPlantingAssociationsRepository,
    private observationsRepository: PostgresAssociationObservationsRepository,
    private compatibilityRepository: PostgresCropCompatibilityRepository,
    private pool: Pool
  ) {}

  async getByPlanting(plantingId: string): Promise<PlantingAssociationWithNames[]> {
    return this.associationsRepository.findByPlantingId(plantingId);
  }

  async getByPlot(plotId: string): Promise<PlantingAssociationWithNames[]> {
    return this.associationsRepository.findByPlotId(plotId);
  }

  async getById(id: string) {
    return this.associationsRepository.findById(id);
  }

  async createAssociation(command: CreateAssociationCommand) {
    if (command.primaryPlantingId === command.companionPlantingId) {
      throw new Error('Cannot create association with itself');
    }

    const existing = await this.pool.query(`
      SELECT id FROM planting_associations 
      WHERE is_active = true
      AND ((primary_planting_id = $1 AND companion_planting_id = $2)
           OR (primary_planting_id = $2 AND companion_planting_id = $1))
    `, [command.primaryPlantingId, command.companionPlantingId]);

    if (existing.rows.length > 0) {
      throw new Error('Association already exists');
    }

    const compatibility = await this.findCompatibility(command.primaryPlantingId, command.companionPlantingId);

    return this.associationsRepository.create({
      primary_planting_id: command.primaryPlantingId,
      companion_planting_id: command.companionPlantingId,
      compatibility_id: compatibility?.id,
      actual_distance_cm: command.actualDistanceCm,
      actual_arrangement: command.actualArrangement,
      actual_ratio: command.actualRatio,
      association_started: new Date(),
      purpose: command.purpose,
      expected_benefit: command.expectedBenefit,
      user_notes: command.userNotes
    });
  }

  async deleteAssociation(id: string): Promise<void> {
    return this.associationsRepository.delete(id);
  }

  async createObservation(command: CreateObservationCommand) {
    return this.observationsRepository.create({
      association_id: command.associationId,
      observed_by: command.observedBy,
      observation_date: new Date(),
      observation_type: command.observationType,
      outcome: command.outcome,
      effectiveness_rating: command.effectivenessRating,
      description: command.description,
      measured_data: command.measuredData
    });
  }

  async getObservations(associationId: string): Promise<AssociationObservationWithNames[]> {
    return this.observationsRepository.findByAssociationId(associationId);
  }

  async getReportByPlot(plotId: string): Promise<any[]> {
    return this.observationsRepository.getReportByPlot(plotId);
  }

  async getCompanionSuggestions(plotId: string, selectedCropCatalogId: string): Promise<CompanionSuggestion[]> {
    const activePlantings = await this.associationsRepository.getActivePlantingsByPlot(plotId);
    
    if (activePlantings.length === 0) {
      return [];
    }

    const suggestions: CompanionSuggestion[] = [];
    const selectedCropId = selectedCropCatalogId;

    for (const planting of activePlantings) {
      if (planting.crop_catalog_id === selectedCropId) {
        continue;
      }

      const compatibility = await this.findCompatibilityByCropIds(selectedCropId, planting.crop_catalog_id);
      
      suggestions.push({
        plantingId: planting.id,
        cropName: planting.crop_name,
        cropFamily: planting.family,
        compatibility: compatibility?.compatibility_level || 'neutral',
        reason: compatibility?.description
      });
    }

    return suggestions;
  }

  private async findCompatibility(planting1Id: string, planting2Id: string): Promise<any | null> {
    const result = await this.pool.query(`
      SELECT cc.* FROM crop_compatibilities cc
      JOIN plantings p1 ON p1.crop_catalog_id = cc.crop_catalog_id
      JOIN plantings p2 ON p2.crop_catalog_id = cc.companion_crop_catalog_id
      WHERE p1.id = $1 AND p2.id = $2
      LIMIT 1
    `, [planting1Id, planting2Id]);

    return result.rows[0] || null;
  }

  private async findCompatibilityByCropIds(cropId1: string, cropId2: string): Promise<any | null> {
    const result = await this.pool.query(`
      SELECT * FROM crop_compatibilities 
      WHERE (crop_catalog_id = $1 AND companion_crop_catalog_id = $2)
         OR (crop_catalog_id = $2 AND companion_crop_catalog_id = $1)
      LIMIT 1
    `, [cropId1, cropId2]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      compatibility_level: this.mapCompatibilityType(row.compatibility_type),
      description: row.description
    };
  }

  private mapCompatibilityType(type: string): 'good' | 'bad' | 'neutral' {
    switch (type) {
      case 'highly_beneficial':
      case 'beneficial':
        return 'good';
      case 'incompatible':
      case 'highly_incompatible':
      case 'cautionary':
        return 'bad';
      default:
        return 'neutral';
    }
  }
}
