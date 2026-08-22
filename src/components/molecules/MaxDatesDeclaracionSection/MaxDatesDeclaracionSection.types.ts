import type { DeclaracionKind, ReglaAnio } from "../../../types/maxDates";

export interface MaxDatesDeclaracionSectionProps {
  kind: DeclaracionKind;
  label: string;
  reglas: ReglaAnio[];
  onEditFecha: (kind: DeclaracionKind, anio: number, fecha: string) => void;
}
