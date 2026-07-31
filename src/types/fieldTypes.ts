export type FieldTypeCategory = "basico" | "complejo" | "contenido";

export interface FieldTypeDef {
  type: string;
  label: string;
  category: FieldTypeCategory;
}
