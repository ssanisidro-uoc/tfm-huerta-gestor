import { Pool } from 'pg';
import { logger } from '../../Shared/infrastructure/Logger';

export interface AuditLogEntry {
  userId?: string;
  userEmail?: string;
  actionType: string;
  actionCategory: string;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changeDescription?: string;
  ipAddress?: string;
  userAgent?: string;
  requestMethod?: string;
  requestPath?: string;
  success?: boolean;
  errorMessage?: string;
}

export class AuditService {
  constructor(private pool: Pool) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const query = `
        INSERT INTO audit_log (
          user_id, user_email, action_type, action_category,
          resource_type, resource_id, resource_name,
          old_values, new_values, change_description,
          ip_address, user_agent, request_method, request_path,
          success, error_message
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `;

      const values = [
        entry.userId || null,
        entry.userEmail || null,
        entry.actionType,
        entry.actionCategory,
        entry.resourceType,
        entry.resourceId || null,
        entry.resourceName || null,
        entry.oldValues ? JSON.stringify(entry.oldValues) : null,
        entry.newValues ? JSON.stringify(entry.newValues) : null,
        entry.changeDescription || null,
        entry.ipAddress || null,
        entry.userAgent || null,
        entry.requestMethod || null,
        entry.requestPath || null,
        entry.success !== undefined ? entry.success : true,
        entry.errorMessage || null
      ];

      await this.pool.query(query, values);
      logger.debug(`Audit: ${entry.actionCategory}.${entry.actionType} on ${entry.resourceType}`, 'AuditService');
    } catch (error: any) {
      logger.error(`Failed to write audit log: ${error.message}`, 'AuditService');
    }
  }

  async getResourceHistory(
    resourceType: string,
    resourceId: string,
    limit: number = 50
  ): Promise<any[]> {
    const query = `
      SELECT 
        id, action_type, action_category, change_description,
        user_email, created_at, old_values, new_values
      FROM audit_log
      WHERE resource_type = $1 AND resource_id = $2
      ORDER BY created_at DESC
      LIMIT $3
    `;

    const result = await this.pool.query(query, [resourceType, resourceId, limit]);
    return result.rows;
  }

  async getUserActivity(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100
  ): Promise<any[]> {
    let query = `
      SELECT 
        id, action_type, action_category, resource_type, resource_id, resource_name,
        change_description, created_at
      FROM audit_log
      WHERE user_id = $1
    `;

    const values: any[] = [userId];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND created_at >= $${paramIndex++}`;
      values.push(startDate);
    }

    if (endDate) {
      query += ` AND created_at <= $${paramIndex++}`;
      values.push(endDate);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;

    const result = await this.pool.query(query, [...values, limit]);
    return result.rows;
  }

  async getGardenActivity(
    gardenId: string,
    limit: number = 100
  ): Promise<any[]> {
    const query = `
      SELECT 
        al.id, al.action_type, al.action_category, al.resource_type,
        al.resource_name, al.change_description, al.user_email, al.created_at
      FROM audit_log al
      WHERE al.resource_type IN ('garden', 'plot', 'planting', 'task')
        AND (
          (al.resource_type = 'garden' AND al.resource_id = $1)
          OR al.resource_id IN (SELECT id FROM plots WHERE garden_id = $1)
          OR al.resource_id IN (SELECT id FROM plantings WHERE garden_id = $1)
          OR al.resource_id IN (SELECT id FROM tasks WHERE garden_id = $1)
        )
      ORDER BY al.created_at DESC
      LIMIT $2
    `;

    const result = await this.pool.query(query, [gardenId, limit]);
    return result.rows;
  }
}