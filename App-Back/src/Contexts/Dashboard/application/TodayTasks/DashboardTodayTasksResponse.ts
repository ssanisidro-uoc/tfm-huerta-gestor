export interface TodayTask {
  id: string;
  title: string;
  description: string | null;
  task_type: string;
  status: string;
  scheduled_date: Date;
  priority: string;
  garden_name: string | null;
  plot_name: string | null;
}

export interface DashboardTodayTasksResponse {
  tasks: TodayTask[];
}