import type { CanvasField } from "../../../types/field";

export interface FieldIdentityCardProps {
  field: CanvasField;
  // La etiqueta externa que aporta el texto visible, si la hay: lo que se muestra es lo que ve el
  // contribuyente, no lo que el campo guarda en su propio label.
  linkedLabel: CanvasField | null;
}
