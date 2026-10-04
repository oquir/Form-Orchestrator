import type { DateBound, DateBoundUnit } from "../../../types/fieldDate";

export interface DateBoundInputProps {
  id: string;
  label: string;
  bound: DateBound | undefined;
  onChange: (bound: DateBound | undefined) => void;
}

// Lo que se elige en el desplegable. "past" y "future" son el mismo limite relativo con distinta
// direccion; se separan aca porque "Hace…" y "Dentro de…" se leen como dos cosas distintas.
export type DateBoundMode = "none" | "today" | "past" | "future" | "fixed";

export interface DateBoundModeOption {
  mode: DateBoundMode;
  label: string;
}

export interface DateBoundUnitOption {
  unit: DateBoundUnit;
  label: string;
}
