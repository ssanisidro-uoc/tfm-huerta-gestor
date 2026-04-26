import { Task } from '../../domain/Task';
import { TaskRepository } from '../../domain/TaskRepository';
import { PostgresRepository } from '../../../Shared/infrastructure/persistence/postgres/PostgresRepository';
import PostgresConfig from '../../../Shared/infrastructure/persistence/postgres/PostgresConfig';
import { Pool } from 'pg';

function toPgArray(arr: string[] | null | undefined): string {
  if (!arr || arr.length === 0) return '{}';
  return '{' + arr.map(s => `"${s.replace(/"/g, '\\"')}`).join(',') + '}';
}

export class PostgresTaskRepository extends PostgresRepository implements TaskRepository {
  constructor(pool: Promise<Pool>, config: PostgresConfig) {
    super(pool, config);
  }

  protected tableName(): string {
    return 'tasks';
  }

  async save(task: Task): Promise<void> {
    await this.save_many([task]);
  }

  async save_many(tasks: Task[]): Promise<void> {
    if (tasks.length === 0) return;

    const placeholders: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const task of tasks) {
      const task_data = task.to_persistence();

      placeholders.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6}, $${paramIndex + 7}, $${paramIndex + 8}, $${paramIndex + 9}, $${paramIndex + 10}, $${paramIndex + 11}, $${paramIndex + 12}, $${paramIndex + 13}, $${paramIndex + 14}, $${paramIndex + 15}, $${paramIndex + 16}, $${paramIndex + 17}, $${paramIndex + 18}, $${paramIndex + 19}, $${paramIndex + 20}, $${paramIndex + 21}, $${paramIndex + 22}, $${paramIndex + 23}, $${paramIndex + 24}, $${paramIndex + 25}, $${paramIndex + 26}, $${paramIndex + 27}, $${paramIndex + 28}, $${paramIndex + 29}, $${paramIndex + 30}, $${paramIndex + 31}, $${paramIndex + 32}, $${paramIndex + 33}, $${paramIndex + 34}, $${paramIndex + 35}, $${paramIndex + 36}, $${paramIndex + 37}, $${paramIndex + 38}, $${paramIndex + 39}, $${paramIndex + 40}, $${paramIndex + 41}, $${paramIndex + 42}, $${paramIndex + 43}, $${paramIndex + 44}, $${paramIndex + 45}, $${paramIndex + 46}, $${paramIndex + 47})`);

      values.push(
        task_data.id, task_data.garden_id, task_data.plot_id, task_data.planting_id,
        task_data.task_type, task_data.task_category, task_data.generated_by, task_data.template_id,
        task_data.title, task_data.description, task_data.instructions, task_data.scheduled_date,
        task_data.due_date, task_data.estimated_duration_minutes, task_data.is_recurring,
        task_data.recurrence_pattern, task_data.recurrence_interval, task_data.recurrence_end_date,
        task_data.parent_task_id, task_data.status, task_data.priority, task_data.completed_at,
        task_data.completed_by, task_data.actual_duration_minutes, task_data.postponed_at,
        task_data.postponed_by, task_data.postponed_reason, task_data.postponed_until,
        task_data.cancelled_at, task_data.cancelled_by, task_data.cancellation_reason,
        task_data.reason, task_data.related_moon_phase, task_data.related_weather_event,
        task_data.climate_triggered, task_data.assigned_to, task_data.assigned_at,
        task_data.completion_notes, task_data.observations,
        task_data.photos, task_data.tags, false, null, true,
        toPgArray(task_data.depends_on_task_ids), toPgArray(task_data.blocks_task_ids),
        task_data.created_at, task_data.updated_at
      );
      paramIndex += 48;
    }

    const query: string = `
      INSERT INTO tasks (
        id, garden_id, plot_id, planting_id, task_type, task_category, generated_by, template_id,
        title, description, instructions, scheduled_date, due_date, estimated_duration_minutes,
        is_recurring, recurrence_pattern, recurrence_interval, recurrence_end_date, parent_task_id,
        status, priority, completed_at, completed_by, actual_duration_minutes,
        postponed_at, postponed_by, postponed_reason, postponed_until,
        cancelled_at, cancelled_by, cancellation_reason,
        reason, related_moon_phase, related_weather_event, climate_triggered,
        assigned_to, assigned_at, completion_notes, observations,
        photos, tags, reminder_sent, reminder_sent_at, is_active, depends_on_task_ids, blocks_task_ids, created_at, updated_at
      ) VALUES ${placeholders.join(', ')}
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        completed_at = EXCLUDED.completed_at,
        updated_at = EXCLUDED.updated_at
    `;

    await this.query(query, values);
  }

  async search_by_id(id: string): Promise<Task | null> {
    const query: string = 'SELECT * FROM tasks WHERE id = $1';

    const result = await this.query<any>(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return Task.from_persistence(result.rows[0]);
  }

  async search_by_garden(
    garden_id: string,
    options?: { page: number; limit: number; offset: number; filters?: { status?: string; task_type?: string; assigned_to?: string } }
  ): Promise<Task[]> {
    let query: string = 'SELECT * FROM tasks WHERE garden_id = $1';
    const values: any[] = [garden_id];
    let paramIndex = 2;

    if (options?.filters) {
      if (options.filters.status) {
        query += ` AND status = $${paramIndex++}`;
        values.push(options.filters.status);
      }
      if (options.filters.task_type) {
        query += ` AND task_type = $${paramIndex++}`;
        values.push(options.filters.task_type);
      }
      if (options.filters.assigned_to) {
        query += ` AND assigned_to = $${paramIndex++}`;
        values.push(options.filters.assigned_to);
      }
    }

    query += ' ORDER BY scheduled_date ASC';

    if (options) {
      query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      values.push(options.limit, options.offset);
    }

    const result = await this.query<any>(query, values);
    return result.rows.map(row => Task.from_persistence(row));
  }

  async find_by_garden(
    garden_id: string,
    options?: { page: number; limit: number; offset: number; filters?: { status?: string; task_type?: string; assigned_to?: string } }
  ): Promise<Task[]> {
    return this.search_by_garden(garden_id, options);
  }

  async count_by_garden(garden_id: string, filters?: { status?: string; task_type?: string; assigned_to?: string }): Promise<number> {
    let query: string = 'SELECT COUNT(*) as total FROM tasks WHERE garden_id = $1';
    const values: any[] = [garden_id];
    let paramIndex = 2;

    if (filters) {
      if (filters.status) {
        query += ` AND status = $${paramIndex++}`;
        values.push(filters.status);
      }
      if (filters.task_type) {
        query += ` AND task_type = $${paramIndex++}`;
        values.push(filters.task_type);
      }
      if (filters.assigned_to) {
        query += ` AND assigned_to = $${paramIndex++}`;
        values.push(filters.assigned_to);
      }
    }

    const result = await this.query<any>(query, values);
    return parseInt(result.rows[0].total, 10);
  }

  async find_by_gardens(
    garden_ids: string[],
    options?: { page: number; limit: number; offset: number; filters?: { status?: string; task_type?: string; assigned_to?: string } }
  ): Promise<Task[]> {
    if (garden_ids.length === 0) return [];

    const filters = options?.filters || {};
    let query: string = `SELECT * FROM tasks WHERE garden_id = ANY($${1})`;
    const values: any[] = [garden_ids];
    let paramIndex = 2;

    if (filters.status) {
      query += ` AND status = $${paramIndex++}`;
      values.push(filters.status);
    }
    if (filters.task_type) {
      query += ` AND task_type = $${paramIndex++}`;
      values.push(filters.task_type);
    }
    if (filters.assigned_to) {
      query += ` AND assigned_to = $${paramIndex++}`;
      values.push(filters.assigned_to);
    }

    query += ` ORDER BY due_date ASC NULLS LAST, scheduled_date ASC NULLS LAST`;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    values.push(limit, offset);

    const result = await this.query<any>(query, values);
    return result.rows.map(row => Task.from_persistence(row));
  }

  async find_by_planting(planting_id: string): Promise<Task[]> {
    const query: string = `
      SELECT * FROM tasks 
      WHERE planting_id = $1 
      ORDER BY scheduled_date DESC
    `;
    
    const result = await this.query<any>(query, [planting_id]);
    return result.rows.map(row => Task.from_persistence(row));
  }

  async count_by_gardens(garden_ids: string[], filters?: { status?: string; task_type?: string; assigned_to?: string }): Promise<number> {
    if (garden_ids.length === 0) return 0;

    let query: string = 'SELECT COUNT(*) as total FROM tasks WHERE garden_id = ANY($1)';
    const values: any[] = [garden_ids];
    let paramIndex = 2;

    if (filters) {
      if (filters.status) {
        query += ` AND status = $${paramIndex++}`;
        values.push(filters.status);
      }
      if (filters.task_type) {
        query += ` AND task_type = $${paramIndex++}`;
        values.push(filters.task_type);
      }
      if (filters.assigned_to) {
        query += ` AND assigned_to = $${paramIndex++}`;
        values.push(filters.assigned_to);
      }
    }

    const result = await this.query<any>(query, values);
    return parseInt(result.rows[0].total, 10);
  }

  async find_by_date_range(
    garden_id: string,
    start_date: Date,
    end_date: Date,
    filters?: { status?: string; task_type?: string }
  ): Promise<Task[]> {
    let query: string = 'SELECT * FROM tasks WHERE garden_id = $1 AND scheduled_date >= $2 AND scheduled_date <= $3';
    const values: any[] = [garden_id, start_date, end_date];
    let paramIndex = 4;

    if (filters) {
      if (filters.status) {
        query += ` AND status = $${paramIndex++}`;
        values.push(filters.status);
      }
      if (filters.task_type) {
        query += ` AND task_type = $${paramIndex++}`;
        values.push(filters.task_type);
      }
    }

    query += ' ORDER BY scheduled_date ASC';

    const result = await this.query<any>(query, values);
    return result.rows.map(row => Task.from_persistence(row));
  }

  async find_recurring_pending(): Promise<Task[]> {
    const query: string = `
      SELECT * FROM tasks 
      WHERE is_recurring = true 
        AND status IN ('pending', 'in_progress')
        AND recurrence_pattern IS NOT NULL
        AND recurrence_interval IS NOT NULL
      ORDER BY scheduled_date ASC
    `;

    const result = await this.query<any>(query, []);
    return result.rows.map(row => Task.from_persistence(row));
  }

  async find_by_date_range_all(
    garden_ids: string[],
    start_date: Date,
    end_date: Date,
    filters?: { status?: string; task_type?: string; plot_id?: string; planting_id?: string; crop_id?: string }
  ): Promise<Task[]> {
    if (garden_ids.length === 0) {
      return [];
    }

    const placeholders = garden_ids.map((_, i) => `$${i + 1}`).join(', ');
    let query: string = `SELECT t.* FROM tasks t`;
    const values: any[] = [...garden_ids, start_date, end_date];
    let paramIndex = garden_ids.length + 3;

    let joinAdded = false;
    
    if (filters?.crop_id) {
      query += ` LEFT JOIN plantings p ON t.planting_id = p.id`;
      joinAdded = true;
    }

    query += ` WHERE t.garden_id IN (${placeholders}) AND t.scheduled_date >= $${garden_ids.length + 1} AND t.scheduled_date <= $${garden_ids.length + 2}`;

    if (filters?.crop_id) {
      query += ` AND p.crop_catalog_id = $${paramIndex++}`;
      values.push(filters.crop_id);
    }

    if (filters?.status) {
      query += ` AND t.status = $${paramIndex++}`;
      values.push(filters.status);
    }
    if (filters?.task_type) {
      query += ` AND t.task_type = $${paramIndex++}`;
      values.push(filters.task_type);
    }
    if (filters?.plot_id) {
      query += ` AND t.plot_id = $${paramIndex++}`;
      values.push(filters.plot_id);
    }
    if (filters?.planting_id) {
      query += ` AND t.planting_id = $${paramIndex++}`;
      values.push(filters.planting_id);
    }

    query += ' ORDER BY t.scheduled_date ASC';

    const result = await this.query<any>(query, values);
    return result.rows.map(row => Task.from_persistence(row));
  }

  async update(task: Task): Promise<void> {
    const task_data = task.to_persistence();

    const query: string = `
      UPDATE tasks SET
        status = $2, completed_at = $3, completed_by = $4,
        postponed_at = $5, postponed_until = $6, postponed_by = $7, postponed_reason = $8,
        updated_at = $9
      WHERE id = $1
    `;

    const values = [
      task_data.id, task_data.status, task_data.completed_at, task_data.completed_by,
      task_data.postponed_at, task_data.postponed_until, task_data.postponed_by, task_data.postponed_reason,
      task_data.updated_at
    ];

    const result = await this.query<any>(query, values);
    if (result.rowCount === 0) {
      throw new Error('Task not found');
    }
  }

  async delete(id: string): Promise<void> {
    const query: string = 'DELETE FROM tasks WHERE id = $1';

    const result = await this.query<any>(query, [id]);
    if (result.rowCount === 0) {
      throw new Error('Task not found');
    }
  }
}
