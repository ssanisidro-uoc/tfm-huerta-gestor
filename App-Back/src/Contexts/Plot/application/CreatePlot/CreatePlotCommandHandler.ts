import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { CreatePlotCommand } from './CreatePlotCommand';
import { PlotCreator } from './PlotCreator';

export class CreatePlotCommandHandler implements CommandHandler<CreatePlotCommand> {
  constructor(private creator: PlotCreator) {}

  subscribedTo(): Command {
    return CreatePlotCommand;
  }

  async handle(command: CreatePlotCommand): Promise<void> {
    await this.creator.run({
      id: command.id,
      garden_id: command.garden_id,
      name: command.name,
      code: command.code,
      surface_m2: command.surface_m2,
      description: command.description,
      length_m: command.length_m,
      width_m: command.width_m,
      shape: command.shape,
      position_x: command.position_x,
      position_y: command.position_y,
      plot_order: command.plot_order,
      soil_type: command.soil_type,
      soil_ph: command.soil_ph,
      soil_quality: command.soil_quality,
      soil_notes: command.soil_notes,
      irrigation_type: command.irrigation_type,
      irrigation_flow_rate: command.irrigation_flow_rate,
      irrigation_notes: command.irrigation_notes,
      has_water_access: command.has_water_access,
      orientation: command.orientation,
      sun_exposure_hours: command.sun_exposure_hours,
      shade_level: command.shade_level,
      has_greenhouse: command.has_greenhouse,
      has_raised_bed: command.has_raised_bed,
      has_mulch: command.has_mulch,
      accessibility: command.accessibility,
      restrictions: command.restrictions
    });
  }
}
