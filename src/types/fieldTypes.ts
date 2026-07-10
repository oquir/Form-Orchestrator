export type FieldTypeCategory = "basico" | "complejo";

export interface FieldTypeDef {
  type: string;
  label: string;
  category: FieldTypeCategory;
}

export const FIELD_TYPES: FieldTypeDef[] = [
  { type: "text", label: "Texto", category: "basico" },
  { type: "number", label: "Número", category: "basico" },
  { type: "select", label: "Select", category: "basico" },
  { type: "textarea", label: "Área de texto", category: "basico" },
  { type: "checkbox", label: "Checkbox", category: "basico" },
  { type: "calculated", label: "Calculado", category: "basico" },
  { type: "toggle_group", label: "Toggle Buttons", category: "complejo" },
];
