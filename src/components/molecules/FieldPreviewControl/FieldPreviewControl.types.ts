import type { CanvasField, FieldOption } from "../../../types/field";

export interface FieldPreviewControlProps {
  field: CanvasField;
}

// Por que un campo de opciones no muestra las suyas: llegan del catalogo, o todavia no se escribieron.
export type OptionsNote = "catalog" | "empty";

// Las opciones que se dibujan en un campo de opciones. Si no tiene propias van dos de muestra y una
// nota que dice por que.
export interface PreviewOptions {
  items: FieldOption[];
  isPlaceholder: boolean;
  note: OptionsNote | null;
}
