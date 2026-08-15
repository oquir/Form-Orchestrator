import type {
  DeclaracionKind,
  FechasMaximasPresentacion,
  ReglaAnio,
} from "../../../../types/maxDates";

export interface DeclaracionSectionProps {
  kind: DeclaracionKind;
  label: string;
  reglas: ReglaAnio[];
  onEditFecha: (kind: DeclaracionKind, anio: number, fecha: string) => void;
}

export interface AnioRowProps {
  regla: ReglaAnio;
  onEditFecha: (fecha: string) => void;
}

export interface PasteFormProps {
  onLoad: (fechas: FechasMaximasPresentacion) => void;
  onClose: () => void;
}
