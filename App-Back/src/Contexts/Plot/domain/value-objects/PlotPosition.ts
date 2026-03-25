import { ValueObject } from '../../../Shared/domain/value-object/ValueObject';

interface PlotPositionProps {
  x: number | null;
  y: number | null;
  order: number | null;
}

export class PlotPosition extends ValueObject<PlotPositionProps> {
  constructor(props: PlotPositionProps) {
    super(props);
  }

  static create(x: number | null, y: number | null, order: number | null = null): PlotPosition {
    return new PlotPosition({ x, y, order });
  }

  static from_persistence(raw: {
    position_x: number | null;
    position_y: number | null;
    plot_order: number | null;
  }): PlotPosition {
    return new PlotPosition({
      x: raw.position_x,
      y: raw.position_y,
      order: raw.plot_order
    });
  }

  has_coordinates(): boolean {
    return this.value.x !== null && this.value.y !== null;
  }

  get_x(): number | null {
    return this.value.x;
  }

  get_y(): number | null {
    return this.value.y;
  }

  get_order(): number | null {
    return this.value.order;
  }

  to_persistence(): {
    position_x: number | null;
    position_y: number | null;
    plot_order: number | null;
  } {
    return {
      position_x: this.value.x,
      position_y: this.value.y,
      plot_order: this.value.order
    };
  }
}
