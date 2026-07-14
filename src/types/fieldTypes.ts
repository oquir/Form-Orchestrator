export type FieldTypeCategory = "basico" | "complejo";

export interface FieldTypeDef {
  type: string;
  label: string;
  category: FieldTypeCategory;
}
