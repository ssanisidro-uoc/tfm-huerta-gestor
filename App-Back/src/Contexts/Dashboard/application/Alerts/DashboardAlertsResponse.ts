export interface Alert {
  id: string;
  type: 'task_overdue' | 'planting_ready' | 'task_today' | 'weather_warning';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  entity_id?: string;
  entity_type?: string;
  created_at: Date;
}

export interface DashboardAlertsResponse {
  alerts: Alert[];
}