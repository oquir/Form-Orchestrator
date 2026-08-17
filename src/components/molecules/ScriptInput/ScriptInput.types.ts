import type { CanvasField } from "../../../types/field";

export interface ScriptInputProps {
  id: string;
  label: string;
  value: string;
  rows?: number;
  // Cuantas lineas puede crecer antes de hacer scroll adentro. El script de una sancion pasa de las
  // cuarenta, y sin techo el panel se estira hasta dejar los avisos fuera de la pantalla.
  maxRows?: number;
  // Con que nombres se sustituye un {campo}: alimenta el pintado, el autocompletado y el aviso.
  knownNames: Set<string>;
  placeholder?: string;
  // Sin lista no se dibuja el insertador. Es lo que distingue al script de un campo del preludio,
  // que no puede leer campos.
  insertCandidates?: CanvasField[];
  onChange: (value: string) => void;
}
