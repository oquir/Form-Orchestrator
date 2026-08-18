import type { ReglaAnio } from "../../../types/maxDates";

export interface MaxDatesAnioRowProps {
  regla: ReglaAnio;
  onEditFecha: (fecha: string) => void;
}
