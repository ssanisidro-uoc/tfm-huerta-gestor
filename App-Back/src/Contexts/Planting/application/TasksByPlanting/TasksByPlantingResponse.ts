export interface TaskHistoryItem {
  task_id: string;
  title: string;
  task_type: string;
  task_category: string | null;
  status: string;
  priority: string;
  scheduled_date: string;
  due_date: string | null;
  completed_at: string | null;
  completed_by: string | null;
  postponed_at: string | null;
  postponed_until: string | null;
  postponed_reason: string | null;
  cancellation_reason: string | null;
  created_at: string;
}

export interface TasksByPlantingResponse {
  planting_id: string;
  crop_name: string;
  plot_name: string;
  garden_name: string;
  tasks: TaskHistoryItem[];
}