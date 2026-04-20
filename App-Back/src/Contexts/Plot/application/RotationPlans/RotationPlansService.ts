import { Pool } from 'pg';

export interface RotationPlan {
  id: string;
  plot_id: string;
  garden_id: string;
  planned_crop_catalog_id: string;
  variety?: string;
  planned_planting_date: Date;
  planned_harvest_date?: Date;
  rotation_cycle_year?: number;
  sequence_order?: number;
  plan_status: string;
  validation_status: string;
  rotation_score?: number;
  primary_goal?: string;
  user_notes?: string;
  executed_planting_id?: string;
  created_at: Date;
  updated_at: Date;
  approved_at?: Date;
  executed_at?: Date;
  crop_name?: string;
  crop_family?: string;
}

export class GetRotationPlansQuery {
  constructor(public readonly plotId: string) {}
}

export class GetRotationPlanByIdQuery {
  constructor(public readonly planId: string) {}
}

export class CreateRotationPlanCommand {
  constructor(
    public readonly plotId: string,
    public readonly cropCatalogId: string,
    public readonly plannedPlantingDate: Date,
    public readonly userId: string,
    public readonly plannedHarvestDate?: Date,
    public readonly rotationCycleYear?: number,
    public readonly sequenceOrder?: number,
    public readonly primaryGoal?: string,
    public readonly userNotes?: string,
    public readonly variety?: string
  ) {}
}

export class UpdateRotationPlanCommand {
  public plannedPlantingDate?: Date;
  public plannedHarvestDate?: Date;
  public rotationCycleYear?: number;
  public sequenceOrder?: number;
  public primaryGoal?: string;
  public userNotes?: string;
  public planStatus?: string;

  constructor(
    public readonly id: string,
    plannedPlantingDate?: Date,
    plannedHarvestDate?: Date,
    rotationCycleYear?: number,
    sequenceOrder?: number,
    primaryGoal?: string,
    userNotes?: string,
    planStatus?: string
  ) {
    this.plannedPlantingDate = plannedPlantingDate;
    this.plannedHarvestDate = plannedHarvestDate;
    this.rotationCycleYear = rotationCycleYear;
    this.sequenceOrder = sequenceOrder;
    this.primaryGoal = primaryGoal;
    this.userNotes = userNotes;
    this.planStatus = planStatus;
  }
}

export class RotationPlansFinder {
  constructor(private pool: Pool) {}

  async findByPlotId(plotId: string): Promise<RotationPlan[]> {
    const query = `
      SELECT 
        rp.id, rp.plot_id, rp.garden_id, rp.planned_crop_catalog_id, rp.variety,
        rp.planned_planting_date, rp.planned_harvest_date,
        rp.rotation_cycle_year, rp.sequence_order, rp.plan_status, rp.validation_status,
        rp.rotation_score, rp.primary_goal, rp.user_notes, rp.executed_planting_id,
        rp.created_at, rp.updated_at, rp.approved_at, rp.executed_at,
        cc.common_name as crop_name, cc.family as crop_family
      FROM rotation_plans rp
      LEFT JOIN crop_catalog cc ON rp.planned_crop_catalog_id = cc.id
      WHERE rp.plot_id = $1
      ORDER BY rp.rotation_cycle_year ASC, rp.sequence_order ASC
    `;

    const result = await this.pool.query(query, [plotId]);
    return result.rows;
  }

  async findById(planId: string): Promise<RotationPlan | null> {
    const query = `
      SELECT 
        rp.*, cc.common_name as crop_name, cc.family as crop_family,
        g.name as garden_name, p.name as plot_name
      FROM rotation_plans rp
      LEFT JOIN crop_catalog cc ON rp.planned_crop_catalog_id = cc.id
      LEFT JOIN gardens g ON rp.garden_id = g.id
      LEFT JOIN plots p ON rp.plot_id = p.id
      WHERE rp.id = $1
    `;

    const result = await this.pool.query(query, [planId]);
    return result.rows[0] || null;
  }
}

export class RotationPlanCreator {
  constructor(private pool: Pool) {}

  async create(command: CreateRotationPlanCommand): Promise<RotationPlan> {
    const gardenQuery = await this.pool.query('SELECT garden_id FROM plots WHERE id = $1', [command.plotId]);
    if (gardenQuery.rows.length === 0) {
      throw new Error('Plot not found');
    }
    const gardenId = gardenQuery.rows[0].garden_id;

    const query = `
      INSERT INTO rotation_plans (
        garden_id, plot_id, created_by, planned_crop_catalog_id, variety,
        planned_planting_date, planned_harvest_date,
        rotation_cycle_year, sequence_order,
        primary_goal, user_notes,
        plan_status, validation_status,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'draft', 'pending', NOW(), NOW())
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      gardenId, command.plotId, command.userId, command.cropCatalogId, command.variety,
      command.plannedPlantingDate, command.plannedHarvestDate,
      command.rotationCycleYear, command.sequenceOrder,
      command.primaryGoal, command.userNotes
    ]);

    return result.rows[0];
  }
}

export class RotationPlanUpdater {
  constructor(private pool: Pool) {}

  async update(command: UpdateRotationPlanCommand): Promise<RotationPlan> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (command.plannedPlantingDate) {
      updates.push(`planned_planting_date = $${paramIndex++}`);
      values.push(command.plannedPlantingDate);
    }
    if (command.plannedHarvestDate) {
      updates.push(`planned_harvest_date = $${paramIndex++}`);
      values.push(command.plannedHarvestDate);
    }
    if (command.rotationCycleYear !== undefined) {
      updates.push(`rotation_cycle_year = $${paramIndex++}`);
      values.push(command.rotationCycleYear);
    }
    if (command.sequenceOrder !== undefined) {
      updates.push(`sequence_order = $${paramIndex++}`);
      values.push(command.sequenceOrder);
    }
    if (command.primaryGoal) {
      updates.push(`primary_goal = $${paramIndex++}`);
      values.push(command.primaryGoal);
    }
    if (command.userNotes !== undefined) {
      updates.push(`user_notes = $${paramIndex++}`);
      values.push(command.userNotes);
    }
    if (command.planStatus) {
      updates.push(`plan_status = $${paramIndex++}`);
      values.push(command.planStatus);
      if (command.planStatus === 'approved') {
        updates.push(`approved_at = NOW()`);
      }
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push(`updated_at = NOW()`);
    values.push(command.id);

    const query = `
      UPDATE rotation_plans SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Rotation plan not found');
    }

    return result.rows[0];
  }

  async delete(planId: string): Promise<void> {
    const result = await this.pool.query('DELETE FROM rotation_plans WHERE id = $1 RETURNING id', [planId]);
    if (result.rows.length === 0) {
      throw new Error('Rotation plan not found');
    }
  }
}
