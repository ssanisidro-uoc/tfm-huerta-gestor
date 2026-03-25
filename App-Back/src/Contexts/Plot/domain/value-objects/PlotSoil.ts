import { ValueObject } from '../../../Shared/domain/value-object/ValueObject';
import { PlotSoilType } from './PlotSoilType';
import { PlotSoilQuality } from './PlotSoilQuality';

interface PlotSoilProps {
  type: PlotSoilType | null;
  ph: number | null;
  quality: PlotSoilQuality | null;
  notes: string | null;
  last_analysis_date: Date | null;
}

export class PlotSoil extends ValueObject<PlotSoilProps> {
  constructor(props: PlotSoilProps) {
    super(props);
    this.validate(props);
  }

  private validate(props: PlotSoilProps): void {
    if (props.ph !== null && (props.ph < 0 || props.ph > 14)) {
      throw new Error(`Soil pH must be between 0 and 14, got: ${props.ph}`);
    }
  }

  static create(params: {
    type?: string | null;
    ph?: number | null;
    quality?: string | null;
    notes?: string | null;
    last_analysis_date?: Date | null;
  }): PlotSoil {
    return new PlotSoil({
      type: params.type ? new PlotSoilType(params.type) : null,
      ph: params.ph ?? null,
      quality: params.quality ? new PlotSoilQuality(params.quality) : null,
      notes: params.notes ?? null,
      last_analysis_date: params.last_analysis_date ?? null
    });
  }

  static from_persistence(raw: {
    soil_type: string | null;
    soil_ph: number | null;
    soil_quality: string | null;
    soil_notes: string | null;
    last_soil_analysis_date: Date | null;
  }): PlotSoil {
    return new PlotSoil({
      type: raw.soil_type ? new PlotSoilType(raw.soil_type) : null,
      ph: raw.soil_ph,
      quality: raw.soil_quality ? new PlotSoilQuality(raw.soil_quality) : null,
      notes: raw.soil_notes,
      last_analysis_date: raw.last_soil_analysis_date
    });
  }

  get_type(): PlotSoilType | null {
    return this.value.type;
  }

  get_ph(): number | null {
    return this.value.ph;
  }

  get_quality(): PlotSoilQuality | null {
    return this.value.quality;
  }

  get_notes(): string | null {
    return this.value.notes;
  }

  get_last_analysis_date(): Date | null {
    return this.value.last_analysis_date;
  }

  has_analysis(): boolean {
    return this.value.last_analysis_date !== null;
  }

  is_optimal_ph(): boolean {
    if (this.value.ph === null) return false;
    return this.value.ph >= 6.0 && this.value.ph <= 7.0;
  }

  to_persistence(): {
    soil_type: string | null;
    soil_ph: number | null;
    soil_quality: string | null;
    soil_notes: string | null;
    last_soil_analysis_date: Date | null;
  } {
    return {
      soil_type: this.value.type?.get_value() ?? null,
      soil_ph: this.value.ph,
      soil_quality: this.value.quality?.get_value() ?? null,
      soil_notes: this.value.notes,
      last_soil_analysis_date: this.value.last_analysis_date
    };
  }
}
