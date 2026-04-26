export interface TaskUserInfo {
  id: string;
  name: string;
  email?: string;
}

export interface TaskWithUserInfo {
  id: string;
  title: string;
  description: string | null;
  scheduled_date: Date;
  status: string;
  task_type: string;
  plot_name: string | null;
  completed_by: TaskUserInfo | null;
  cancelled_by: TaskUserInfo | null;
  postponed_by: TaskUserInfo | null;
  completed_at: Date | null;
  cancelled_at: Date | null;
  postponed_at: Date | null;
  postponed_until: Date | null;
  postponed_reason: string | null;
  cancellation_reason: string | null;
}

export interface TasksByPlantingData {
  tasks: TaskWithUserInfo[];
}

export class TasksByPlantingResponse {
  constructor(public tasks: TasksByPlantingData['tasks']) {}
}