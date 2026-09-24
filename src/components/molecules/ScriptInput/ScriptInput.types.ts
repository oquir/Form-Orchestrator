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
  onChange: (value: string) => void;
}
