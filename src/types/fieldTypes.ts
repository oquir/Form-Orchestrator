export interface FieldTypeDef {
  type: string;
  label: string;
}

export const FIELD_TYPES: FieldTypeDef[] = [
  { type: "text", label: "Texto" },
  { type: "number", label: "Número" },
  { type: "select", label: "Select" },
  { type: "textarea", label: "Área de texto" },
  { type: "checkbox", label: "Checkbox" },
  { type: "calculated", label: "Calculado" },
];
