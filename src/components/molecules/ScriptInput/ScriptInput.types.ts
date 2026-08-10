import type { CanvasField } from "../../../types/field";

export interface ScriptInputProps {
  id: string;
  label: string;
  value: string;
  rows?: number;
  placeholder?: string;
  // Sin lista no se dibuja el insertador. Es lo que distingue al script de un campo del preludio,
  // que no puede leer campos.
  insertCandidates?: CanvasField[];
  onChange: (value: string) => void;
}
