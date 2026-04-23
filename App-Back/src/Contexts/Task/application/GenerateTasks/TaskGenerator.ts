import { GardenId } from '../../../Garden/domain/value-objects/GardenId';
import { Task } from '../../domain/Task';
import { TaskId } from '../../domain/value-objects/TaskId';
import { TaskTitle } from '../../domain/value-objects/TaskTitle';

interface TaskTemplate {
  task_type: string;
  task_category: string;
  days_offset: number;
  title_template: string;
  description_template: string;
  priority: string;
  estimated_duration_minutes: number;
  is_recurring: boolean;
  recurrence_pattern?: string;
  recurrence_interval?: number;
}

interface CropData {
  name: string;
  days_to_maturity: number;
  water_requirement?: string;
  average_yield_kg_per_m2?: number;
  common_pests?: any;
  seed_depth_cm?: number;
}

export class TaskGenerator {
  private static readonly TASK_TEMPLATES: TaskTemplate[] = [
    {
      task_type: 'planting',
      task_category: 'planting',
      days_offset: 0,
      title_template: 'Siembra de {crop_name}',
      description_template: 'Realizar la siembra de {crop_name}',
      priority: 'high',
      estimated_duration_minutes: 60,
      is_recurring: false
    },
    {
      task_type: 'watering',
      task_category: 'watering',
      days_offset: 2,
      title_template: 'Riego de {crop_name}',
      description_template: 'Regar {crop_name}. Frecuencia: según disponibilidad de agua',
      priority: 'medium',
      estimated_duration_minutes: 30,
      is_recurring: true,
      recurrence_pattern: 'weekly',
      recurrence_interval: 2
    },
    {
      task_type: 'fertilizing',
      task_category: 'nutrition',
      days_offset: 15,
      title_template: 'Abonado de {crop_name}',
      description_template: 'Aplicar fertilizante a {crop_name}. Primera aplicación post-siembra',
      priority: 'medium',
      estimated_duration_minutes: 45,
      is_recurring: true,
      recurrence_pattern: 'monthly',
      recurrence_interval: 1
    },
    {
      task_type: 'weeding',
      task_category: 'maintenance',
      days_offset: 10,
      title_template: 'Escarda de {crop_name}',
      description_template: 'Eliminar malezas alrededor de {crop_name}',
      priority: 'low',
      estimated_duration_minutes: 40,
      is_recurring: true,
      recurrence_pattern: 'weekly',
      recurrence_interval: 1
    },
    {
      task_type: 'treatment',
      task_category: 'pest_disease',
      days_offset: 20,
      title_template: 'Tratamiento fitosanitario de {crop_name}',
      description_template: 'Revisar estado fitosanitario de {crop_name}',
      priority: 'medium',
      estimated_duration_minutes: 45,
      is_recurring: true,
      recurrence_pattern: 'monthly',
      recurrence_interval: 1
    },
    {
      task_type: 'harvesting',
      task_category: 'harvesting',
      days_offset: 0,
      title_template: 'Cosecha de {crop_name}',
      description_template: 'Recoger cosecha de {crop_name}',
      priority: 'high',
      estimated_duration_minutes: 120,
      is_recurring: false
    }
  ];

  generateFromPlanting(
    plantingId: string,
    gardenId: string,
    plotId: string,
    plantedAt: Date,
    daysToMaturity: number,
    cropName: string
  ): Task[] {
    const tasks: Task[] = [];

    for (const template of TaskGenerator.TASK_TEMPLATES) {
      let daysOffset = template.days_offset;

      if (template.task_type === 'harvest') {
        daysOffset = daysToMaturity;
      }

      const scheduledDate = new Date(plantedAt);
      scheduledDate.setDate(scheduledDate.getDate() + daysOffset);
      scheduledDate.setHours(4, 0, 0, 0);

      if (scheduledDate < new Date()) {
        continue;
      }

      const title = template.title_template.replace('{crop_name}', cropName);

      const description = template.description_template.replace('{crop_name}', cropName);

      const dueDate =
        template.task_type === 'harvest'
          ? new Date(plantedAt.getTime() + daysToMaturity * 24 * 60 * 60 * 1000)
          : null;

      const task = new Task({
        id: new TaskId(crypto.randomUUID()),
        garden_id: new GardenId(gardenId),
        task_type: template.task_type,
        task_category: template.task_category,
        title: new TaskTitle(title),
        scheduled_date: scheduledDate,
        due_date: dueDate,
        plot_id: plotId,
        planting_id: plantingId,
        description: description,
        is_recurring: template.is_recurring,
        recurrence_pattern: template.recurrence_pattern,
        recurrence_interval: template.recurrence_interval,
        generated_by: 'system',
        estimated_duration_minutes: template.estimated_duration_minutes,
        priority: template.priority,
        created_at: new Date(),
        updated_at: new Date()
      });

      tasks.push(task);
    }

    return tasks;
  }
}
